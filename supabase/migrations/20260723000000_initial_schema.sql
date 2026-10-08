-- Booky — baseline schema (reconstructed from the live project on 2026-10-09).
-- This captures what was created by hand in the Supabase dashboard on 2026-07-23
-- so the database can be rebuilt from the repo. Later migrations build on it.

create table public.businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  slug          text not null unique,
  name          text not null,
  tagline_tr    text,
  tagline_en    text,
  address       text,
  maps_url      text,
  phone         text,
  plan          text not null default 'solo' check (plan in ('solo', 'pro', 'isletme')),
  created_at    timestamptz not null default now(),
  category      text,
  contact_email text,
  owner_name    text
);

create table public.services (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  name_tr      text not null,
  name_en      text not null,
  duration_min integer not null,
  price        numeric not null default 0,
  deposit      numeric not null default 0,
  color        text not null default 'hair',
  created_at   timestamptz not null default now()
);
create index services_business_id_idx on public.services (business_id);

create table public.staff (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name        text not null,
  role_tr     text,
  role_en     text,
  initials    text,
  start_min   integer not null default 540,
  end_min     integer not null default 1080,
  online      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index staff_business_id_idx on public.staff (business_id);

create table public.staff_services (
  staff_id   uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name        text not null,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index clients_business_id_idx on public.clients (business_id);

create table public.appointments (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  service_id   uuid references public.services(id) on delete set null,
  staff_id     uuid references public.staff(id) on delete set null,
  client_id    uuid references public.clients(id) on delete set null,
  client_name  text not null,
  client_phone text not null,
  starts_at    timestamptz not null,
  duration_min integer not null,
  status       text not null default 'booked' check (status in ('booked', 'checked-in', 'done', 'no-show')),
  deposit_paid boolean not null default false,
  note         text,
  sms_consent  boolean not null default false,
  created_at   timestamptz not null default now(),
  price        numeric not null default 0,
  source       text not null default 'online' check (source in ('online', 'walk-in', 'phone'))
);
create index appointments_business_id_idx on public.appointments (business_id);
create index appointments_starts_at_idx on public.appointments (starts_at);

create table public.subscriptions (
  business_id            uuid primary key references public.businesses(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan_id                text,
  status                 text,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

-- ── Row level security ───────────────────────────────────────────────────────
alter table public.businesses     enable row level security;
alter table public.services       enable row level security;
alter table public.staff          enable row level security;
alter table public.staff_services enable row level security;
alter table public.clients        enable row level security;
alter table public.appointments   enable row level security;
alter table public.subscriptions  enable row level security;

create policy businesses_public_read  on public.businesses for select using (true);
create policy businesses_owner_insert on public.businesses for insert with check (auth.uid() = owner_id);
create policy businesses_owner_update on public.businesses for update using (auth.uid() = owner_id);
create policy businesses_owner_delete on public.businesses for delete using (auth.uid() = owner_id);

create policy services_public_read  on public.services for select using (true);
create policy services_owner_insert on public.services for insert with check (exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid()));
create policy services_owner_update on public.services for update using (exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid()));
create policy services_owner_delete on public.services for delete using (exists (select 1 from public.businesses b where b.id = services.business_id and b.owner_id = auth.uid()));

create policy staff_public_read  on public.staff for select using (true);
create policy staff_owner_insert on public.staff for insert with check (exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid()));
create policy staff_owner_update on public.staff for update using (exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid()));
create policy staff_owner_delete on public.staff for delete using (exists (select 1 from public.businesses b where b.id = staff.business_id and b.owner_id = auth.uid()));

create policy staff_services_public_read  on public.staff_services for select using (true);
create policy staff_services_owner_insert on public.staff_services for insert with check (exists (select 1 from public.staff s join public.businesses b on b.id = s.business_id where s.id = staff_services.staff_id and b.owner_id = auth.uid()));
create policy staff_services_owner_delete on public.staff_services for delete using (exists (select 1 from public.staff s join public.businesses b on b.id = s.business_id where s.id = staff_services.staff_id and b.owner_id = auth.uid()));

create policy clients_public_insert on public.clients for insert with check (true);
create policy clients_owner_read   on public.clients for select using (exists (select 1 from public.businesses b where b.id = clients.business_id and b.owner_id = auth.uid()));
create policy clients_owner_update on public.clients for update using (exists (select 1 from public.businesses b where b.id = clients.business_id and b.owner_id = auth.uid()));
create policy clients_owner_delete on public.clients for delete using (exists (select 1 from public.businesses b where b.id = clients.business_id and b.owner_id = auth.uid()));

create policy appointments_public_insert on public.appointments for insert with check (true);
create policy appointments_owner_read   on public.appointments for select using (exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()));
create policy appointments_owner_update on public.appointments for update using (exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()));
create policy appointments_owner_delete on public.appointments for delete using (exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()));

create policy subscriptions_owner_read on public.subscriptions for select using (exists (select 1 from public.businesses b where b.id = subscriptions.business_id and b.owner_id = auth.uid()));

-- Public booking page: which slots are taken (no client details leak out).
create or replace function public.get_booked_slots(p_business_id uuid, p_day date)
returns table (staff_id uuid, starts_at timestamptz, duration_min integer)
language sql
security definer
set search_path = public
as $$
  select staff_id, starts_at, duration_min
  from public.appointments
  where business_id = p_business_id
    and starts_at >= p_day::timestamptz
    and starts_at < (p_day + interval '1 day')::timestamptz
    and status <> 'no-show';
$$;
