-- Booky — cancellations + SMS reminder bookkeeping (2026-10-09)
--
-- 1. Appointments can be cancelled. A cancelled appointment frees its slot
--    (public availability + booking RPC ignore it) but stays in history.
-- 2. reminder_24h_sent_at / reminder_2h_sent_at let /api/reminders/cron send
--    each reminder exactly once.

alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('booked', 'checked-in', 'done', 'no-show', 'cancelled'));

alter table public.appointments
  add column if not exists cancelled_at timestamptz,
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_2h_sent_at timestamptz;

create index if not exists appointments_reminders_idx
  on public.appointments (starts_at)
  where status = 'booked' and sms_consent;

-- Same functions as before, but cancelled appointments no longer block a slot.
create or replace function public.get_booked_slots(p_business_id uuid, p_day date)
returns table (staff_id uuid, starts_at timestamptz, duration_min integer)
language sql
stable
security definer
set search_path = public
as $$
  select a.staff_id, a.starts_at, a.duration_min
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  where a.business_id = p_business_id
    and a.starts_at >= (p_day::timestamp at time zone b.timezone)
    and a.starts_at <  ((p_day + 1)::timestamp at time zone b.timezone)
    and a.status not in ('no-show', 'cancelled');
$$;

create or replace function public.book_appointment(
  p_business_id  uuid,
  p_service_id   uuid,
  p_staff_id     uuid,
  p_starts_at    timestamptz,
  p_client_name  text,
  p_client_phone text,
  p_note         text default null,
  p_sms_consent  boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz        text;
  v_svc       public.services%rowtype;
  v_name      text := btrim(coalesce(p_client_name, ''));
  v_raw       text := btrim(coalesce(p_client_phone, ''));
  v_digits    text := regexp_replace(coalesce(p_client_phone, ''), '[^0-9]', '', 'g');
  v_phone     text;
  v_note      text := nullif(btrim(coalesce(p_note, '')), '');
  v_end       timestamptz;
  v_local     timestamp;
  v_start_min integer;
  v_end_min   integer;
  v_staff_id  uuid;
  v_has_staff boolean;
  v_client_id uuid;
  v_appt_id   uuid;
begin
  -- Normalise Turkish numbers to 05XXXXXXXXX so "+90 532…" and "0532…" match.
  if v_digits ~ '^90[0-9]{10}$' then
    v_phone := '0' || substr(v_digits, 3);
  elsif v_digits ~ '^[1-9][0-9]{9}$' then
    v_phone := '0' || v_digits;
  elsif left(v_raw, 1) = '+' then
    v_phone := '+' || v_digits;
  else
    v_phone := v_digits;
  end if;

  -- Input validation
  if length(v_name) < 2 or length(v_name) > 100 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if length(regexp_replace(v_phone, '[^0-9]', '', 'g')) < 10 or length(v_phone) > 20 then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if v_note is not null and length(v_note) > 500 then
    raise exception 'invalid_note' using errcode = '22023';
  end if;

  select timezone into v_tz from public.businesses where id = p_business_id;
  if v_tz is null then
    raise exception 'invalid_business' using errcode = '22023';
  end if;

  select * into v_svc from public.services where id = p_service_id and business_id = p_business_id;
  if not found then
    raise exception 'invalid_service' using errcode = '22023';
  end if;

  if p_starts_at is null
     or p_starts_at < now() + interval '5 minutes'
     or p_starts_at > now() + interval '90 days' then
    raise exception 'invalid_time' using errcode = '22023';
  end if;

  v_end       := p_starts_at + make_interval(mins => v_svc.duration_min);
  v_local     := p_starts_at at time zone v_tz;
  v_start_min := extract(hour from v_local)::int * 60 + extract(minute from v_local)::int;
  v_end_min   := v_start_min + v_svc.duration_min;

  -- One booking at a time per business, so two people can't grab the same slot.
  perform pg_advisory_xact_lock(hashtextextended(p_business_id::text, 0));

  -- Spam guard: at most 3 upcoming bookings per phone number per business.
  if (select count(*) from public.appointments
       where business_id = p_business_id and client_phone = v_phone
         and status = 'booked' and starts_at > now()) >= 3 then
    raise exception 'too_many_bookings' using errcode = '22023';
  end if;

  select exists (select 1 from public.staff where business_id = p_business_id and online)
    into v_has_staff;

  if v_has_staff then
    -- A specific staff member, or (p_staff_id null) the least-busy free one that day.
    select s.id into v_staff_id
    from public.staff s
    where s.business_id = p_business_id
      and s.online
      and (p_staff_id is null or s.id = p_staff_id)
      and v_start_min >= s.start_min
      and v_end_min   <= s.end_min
      and not exists (
        select 1 from public.appointments a
        where a.business_id = p_business_id
          and (a.staff_id = s.id or a.staff_id is null)
          and a.status not in ('no-show', 'cancelled')
          and a.starts_at < v_end
          and a.starts_at + make_interval(mins => a.duration_min) > p_starts_at
      )
    order by (
      select count(*) from public.appointments a2
      where a2.staff_id = s.id
        and a2.starts_at >= date_trunc('day', v_local) at time zone v_tz
        and a2.starts_at <  (date_trunc('day', v_local) + interval '1 day') at time zone v_tz
    ), s.created_at
    limit 1;

    if v_staff_id is null then
      raise exception 'slot_taken' using errcode = '22023';
    end if;
  else
    -- No staff configured: the business itself is the single resource.
    if exists (
      select 1 from public.appointments a
      where a.business_id = p_business_id
        and a.status not in ('no-show', 'cancelled')
        and a.starts_at < v_end
        and a.starts_at + make_interval(mins => a.duration_min) > p_starts_at
    ) then
      raise exception 'slot_taken' using errcode = '22023';
    end if;
  end if;

  -- Find or create the client by phone so repeat customers are recognised.
  select id into v_client_id from public.clients
  where business_id = p_business_id and phone = v_phone
  order by created_at
  limit 1;

  if v_client_id is null then
    insert into public.clients (business_id, name, phone)
    values (p_business_id, v_name, v_phone)
    returning id into v_client_id;
  end if;

  insert into public.appointments (
    business_id, service_id, staff_id, client_id, client_name, client_phone,
    starts_at, duration_min, status, price, source, note, sms_consent
  ) values (
    p_business_id, v_svc.id, v_staff_id, v_client_id, v_name, v_phone,
    p_starts_at, v_svc.duration_min, 'booked', v_svc.price, 'online', v_note, coalesce(p_sms_consent, false)
  )
  returning id into v_appt_id;

  return jsonb_build_object('appointment_id', v_appt_id, 'staff_id', v_staff_id);
end;
$$;
