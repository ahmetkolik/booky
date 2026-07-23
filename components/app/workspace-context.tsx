"use client";

/**
 * Workspace layer — decides what the panel shows.
 *
 * Three modes:
 *  - "demo":  seeded from lib/demo/data (Studio Lumière). Entered via
 *             "Continue with demo" or logging in without a workspace.
 *  - "fresh": created by signup → onboarding when Supabase isn't configured.
 *             Starts with ZERO data, persisted to localStorage.
 *  - "live":  a real Supabase-authenticated business. Data is fetched from
 *             and written to Postgres (RLS-scoped to the owner); every
 *             mutator writes then refetches the affected collections.
 *
 * Consumers only ever see the WorkspaceValue shape below — which mode is
 * active is decided once, on mount, by checking for a Supabase session.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  services as demoServicesData,
  staff as demoStaffData,
  appointments as demoAppointmentsData,
  clients as demoClientsData,
  activity as demoActivityData,
  bookingPage as demoBookingPage,
  DEMO_PLAN,
  type Plan,
  type Service,
  type ServiceColor,
  type Staff,
  type Appointment,
  type ApptStatus,
  type Client,
  type DActivity,
} from "@/lib/demo/data";
import { PLAN_BY_ID, type Plan as PlanDef } from "@/lib/stripe/plans";
import type { L } from "@/lib/i18n/config";
import { createClient as createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { toStartsAtISO, fromStartsAt } from "@/lib/scheduling";
import type { SupabaseClient } from "@supabase/supabase-js";

const WS_KEY = "booky.workspace.v1";
const DATA_KEY = "booky.data.v1";
const PENDING_KEY = "booky.pending-signup.v1";

export interface WorkspaceBusiness {
  name: string;
  slug: string;
  category: string;
  email: string;
  owner: string;
}

export interface WorkspaceLocation {
  address: string;
  mapsUrl: string;
}

interface StoredWorkspace {
  mode: "demo" | "fresh";
  business: WorkspaceBusiness;
  location: WorkspaceLocation;
  plan: Plan;
}

interface Collections {
  services: Service[];
  staff: Staff[];
  appointments: Appointment[];
  clients: Client[];
  activity: DActivity[];
}

const DEMO_WORKSPACE: StoredWorkspace = {
  mode: "demo",
  business: {
    name: demoBookingPage.business,
    slug: "studio-lumiere",
    category: "Güzellik & bakım",
    email: "owner@studiolumiere.co",
    owner: "Studio Lumière",
  },
  location: { address: demoBookingPage.address, mapsUrl: demoBookingPage.mapsUrl },
  plan: DEMO_PLAN,
};

const DEMO_COLLECTIONS: Collections = {
  services: demoServicesData,
  staff: demoStaffData,
  appointments: demoAppointmentsData,
  clients: demoClientsData,
  activity: demoActivityData,
};

const EMPTY_COLLECTIONS: Collections = {
  services: [],
  staff: [],
  appointments: [],
  clients: [],
  activity: [],
};

/* ── Static helpers (usable outside the provider: auth + onboarding) ──────── */

export function startDemoSession() {
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(DEMO_WORKSPACE));
  } catch {}
}

export function hasWorkspace(): boolean {
  try {
    return localStorage.getItem(WS_KEY) !== null;
  } catch {
    return false;
  }
}

export interface PendingSignup {
  name: string;
  email: string;
  plan: Plan;
}

export function storePendingSignup(p: PendingSignup) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {}
}

export function readPendingSignup(): PendingSignup | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingSignup) : null;
  } catch {
    return null;
  }
}

/** Creates a brand-new empty workspace — the "start from zero" path (no Supabase). */
export function createFreshWorkspace(input: {
  name: string;
  slug: string;
  category: string;
  email?: string;
  owner?: string;
  plan?: Plan;
}) {
  const ws: StoredWorkspace = {
    mode: "fresh",
    business: {
      name: input.name,
      slug: input.slug,
      category: input.category,
      email: input.email || "owner@" + input.slug + ".com",
      owner: input.owner || input.name,
    },
    location: { address: "", mapsUrl: "" },
    plan: input.plan ?? "solo",
  };
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(ws));
    localStorage.setItem(DATA_KEY, JSON.stringify(EMPTY_COLLECTIONS));
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("tr");
}

/* ── Live (Supabase) row shapes + mappers ───────────────────────────────────
   DB rows use snake_case + bilingual columns (name_tr/name_en); UI types use
   camelCase + the { tr, en } shape. dayOffset/startMin (minutes from today's
   midnight) round-trip to/from a real `starts_at` timestamptz. */

interface BusinessRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string | null;
  contact_email: string | null;
  owner_name: string | null;
  address: string | null;
  maps_url: string | null;
  plan: Plan;
}

function buildAppointmentsUi(rows: any[]): Appointment[] {
  const byClient = new Map<string, any[]>();
  for (const r of rows) {
    const key = r.client_id ?? r.client_phone;
    const list = byClient.get(key) ?? [];
    list.push(r);
    byClient.set(key, list);
  }
  const pastVisits = new Map<string, number>();
  for (const list of byClient.values()) {
    list.sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
    list.forEach((r, idx) => pastVisits.set(r.id, idx));
  }
  return rows.map((r) => {
    const { dayOffset, startMin } = fromStartsAt(r.starts_at);
    return {
      id: r.id,
      client: r.client_name,
      clientInitials: initialsOf(r.client_name),
      clientPhone: r.client_phone,
      serviceId: r.service_id,
      staffId: r.staff_id,
      dayOffset,
      startMin,
      status: r.status as ApptStatus,
      price: Number(r.price),
      paid: r.deposit_paid,
      source: r.source as Appointment["source"],
      pastVisits: pastVisits.get(r.id) ?? 0,
      note: r.note ? ({ tr: r.note, en: r.note } as L) : undefined,
    } satisfies Appointment;
  });
}

function buildServicesUi(rows: any[], apptRows: any[]): Service[] {
  const cutoff = Date.now() - 30 * 86_400_000;
  return rows.map((row) => ({
    id: row.id,
    name: { tr: row.name_tr, en: row.name_en },
    durationMin: row.duration_min,
    price: Number(row.price),
    color: row.color as ServiceColor,
    deposit: Number(row.deposit),
    bookings30d: apptRows.filter(
      (a) => a.service_id === row.id && new Date(a.starts_at).getTime() >= cutoff,
    ).length,
  }));
}

function buildStaffUi(rows: any[], apptsUi: Appointment[], serviceRows: any[]): Staff[] {
  const durationById = new Map(serviceRows.map((s) => [s.id, s.duration_min as number]));
  return rows.map((row) => {
    const todays = apptsUi.filter(
      (a) => a.staffId === row.id && a.dayOffset === 0 && a.status !== "no-show",
    );
    const bookedMin = todays.reduce((sum, a) => sum + (durationById.get(a.serviceId) ?? 0), 0);
    const windowMin = Math.max(1, row.end_min - row.start_min);
    return {
      id: row.id,
      name: row.name,
      initials: row.initials || initialsOf(row.name),
      role: { tr: row.role_tr ?? "", en: row.role_en ?? "" },
      startMin: row.start_min,
      endMin: row.end_min,
      utilization: Math.min(100, Math.round((bookedMin / windowMin) * 100)),
      online: row.online,
    };
  });
}

function buildClientsUi(rows: any[], apptsUi: Appointment[]): Client[] {
  return rows.map((row) => {
    const mine = apptsUi.filter((a) => a.clientPhone === row.phone);
    const visits = mine.length;
    const spend = mine.filter((a) => a.status === "done").reduce((s, a) => s + a.price, 0);
    const lastVisitMs = mine.length
      ? Math.max(...mine.map((a) => Date.parse(toStartsAtISO(a.dayOffset, a.startMin))))
      : Date.parse(row.created_at);
    const lastVisit = new Date(lastVisitMs).toISOString().slice(0, 10);
    const daysSince = (Date.now() - lastVisitMs) / 86_400_000;
    const tag: Client["tag"] = visits === 0 ? "new" : daysSince > 45 ? "lapsed" : visits >= 10 ? "vip" : "regular";
    return {
      id: row.id,
      name: row.name,
      initials: initialsOf(row.name),
      email: row.email ?? "",
      phone: row.phone ?? "",
      visits,
      spend,
      lastVisit,
      tag,
    };
  });
}

function buildActivityUi(rows: any[], servicesUi: Service[]): DActivity[] {
  const nameById = new Map(servicesUi.map((s) => [s.id, s.name.tr]));
  return [...rows]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 8)
    .map((r) => ({
      id: `live-${r.id}`,
      who: r.client_name,
      action: { tr: "randevu aldı:", en: "booked:" } as L,
      target: nameById.get(r.service_id) ?? "",
      at: r.created_at,
      tone: "success" as const,
    }));
}

/* ── Context ──────────────────────────────────────────────────────────────── */

export interface BookingInfo {
  business: string;
  tagline: L;
  rating: number;
  reviews: number;
  address: string;
  mapsUrl: string;
  options: string[];
  slots: number[];
  url: string;
}

interface WorkspaceValue {
  ready: boolean;
  isDemo: boolean;
  business: WorkspaceBusiness;
  setBusiness: (b: WorkspaceBusiness) => void;
  location: WorkspaceLocation;
  setLocation: (loc: WorkspaceLocation) => void;

  plan: Plan;
  setPlan: (p: Plan) => void;
  planDef: PlanDef;
  atLeast: (required: Plan) => boolean;
  canAddStaff: boolean;
  canAddBooking: boolean;

  services: Service[];
  serviceById: (id: string) => Service;
  addService: (s: Omit<Service, "id" | "bookings30d">) => void;
  updateService: (id: string, patch: Partial<Omit<Service, "id">>) => void;
  deleteService: (id: string) => void;

  staff: Staff[];
  staffById: (id: string) => Staff;
  addStaff: (s: Omit<Staff, "id" | "initials" | "utilization" | "online">) => void;

  appointments: Appointment[];
  addAppointment: (a: {
    client: string;
    clientPhone: string;
    serviceId: string;
    staffId: string;
    dayOffset: number;
    startMin: number;
  }) => void;
  setApptStatus: (id: string, status: ApptStatus) => void;

  clients: Client[];
  addClient: (c: { name: string; phone: string; email: string }) => void;

  activity: DActivity[];
  bookingInfo: BookingInfo;
}

const ORDER: Plan[] = ["solo", "pro", "isletme"];

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ws, setWs] = useState<StoredWorkspace>(DEMO_WORKSPACE);
  const [data, setData] = useState<Collections>(DEMO_COLLECTIONS);
  const modeRef = useRef<"demo" | "fresh" | "live">("demo");

  const [live, setLive] = useState<BusinessRow | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const refetchLive = useCallback(async (businessId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const [servicesRes, staffRes, clientsRes, apptsRes] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at"),
      supabase.from("staff").select("*").eq("business_id", businessId).order("created_at"),
      supabase.from("clients").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").eq("business_id", businessId).order("starts_at"),
    ]);
    const apptRows = apptsRes.data ?? [];
    const serviceRows = servicesRes.data ?? [];
    const apptsUi = buildAppointmentsUi(apptRows);
    const servicesUi = buildServicesUi(serviceRows, apptRows);
    setData({
      services: servicesUi,
      staff: buildStaffUi(staffRes.data ?? [], apptsUi, serviceRows),
      appointments: apptsUi,
      clients: buildClientsUi(clientsRes.data ?? [], apptsUi),
      activity: buildActivityUi(apptRows, servicesUi),
    });
  }, []);

  // Load persisted workspace after mount (SSR renders nothing until ready).
  // setTimeout, not rAF: browsers pause rAF for occluded windows, which would
  // leave the panel blank until the tab becomes visible again.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (supabaseConfigured) {
        const supabase = createBrowserSupabase();
        supabaseRef.current = supabase;
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { data: biz } = await supabase
            .from("businesses")
            .select("*")
            .eq("owner_id", session.user.id)
            .maybeSingle();

          if (biz && !cancelled) {
            modeRef.current = "live";
            setLive(biz as BusinessRow);
            await refetchLive(biz.id);
            if (!cancelled) setReady(true);
            return;
          }
        }
      }

      // Fallback: legacy localStorage demo/fresh workspace.
      try {
        const raw = localStorage.getItem(WS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredWorkspace;
          const merged: StoredWorkspace = {
            ...DEMO_WORKSPACE,
            ...parsed,
            business: { ...DEMO_WORKSPACE.business, ...parsed.business },
            location: { ...DEMO_WORKSPACE.location, ...parsed.location },
          };
          if (!cancelled) setWs(merged);
          modeRef.current = merged.mode;
          if (merged.mode === "fresh") {
            const rawData = localStorage.getItem(DATA_KEY);
            if (!cancelled) {
              setData(
                rawData
                  ? { ...EMPTY_COLLECTIONS, ...(JSON.parse(rawData) as Collections) }
                  : EMPTY_COLLECTIONS,
              );
            }
          }
        }
      } catch {}
      if (!cancelled) setReady(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [refetchLive]);

  const persistWs = useCallback((next: StoredWorkspace) => {
    setWs(next);
    try {
      localStorage.setItem(WS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  /** Apply a collections update; fresh workspaces persist to localStorage. */
  const commit = useCallback((updater: (prev: Collections) => Collections) => {
    setData((prev) => {
      const next = updater(prev);
      if (modeRef.current === "fresh") {
        try {
          localStorage.setItem(DATA_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }, []);

  const log = useCallback(
    (who: string, action: L, target: string, tone: DActivity["tone"] = "success") => {
      commit((prev) => ({
        ...prev,
        activity: [
          { id: `act-${Date.now()}`, who, action, target, at: new Date().toISOString(), tone },
          ...prev.activity,
        ].slice(0, 20),
      }));
    },
    [commit],
  );

  const value = useMemo<WorkspaceValue>(() => {
    const isLive = modeRef.current === "live" && live !== null;
    const planDef = PLAN_BY_ID[isLive ? live!.plan : ws.plan];
    const isDemo = !isLive && ws.mode === "demo";

    const business: WorkspaceBusiness = isLive
      ? {
          name: live!.name,
          slug: live!.slug,
          category: live!.category ?? "",
          email: live!.contact_email ?? "",
          owner: live!.owner_name ?? live!.name,
        }
      : ws.business;

    const location: WorkspaceLocation = isLive
      ? { address: live!.address ?? "", mapsUrl: live!.maps_url ?? "" }
      : ws.location;

    const serviceById = (id: string) => data.services.find((s) => s.id === id)!;
    const staffById = (id: string) => data.staff.find((s) => s.id === id)!;

    function setBusiness(b: WorkspaceBusiness) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("businesses")
          .update({ name: b.name, contact_email: b.email })
          .eq("id", live!.id)
          .select()
          .single()
          .then(({ data: row }) => {
            if (row) setLive(row as BusinessRow);
          });
        return;
      }
      persistWs({ ...ws, business: b });
    }

    function setLocation(loc: WorkspaceLocation) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("businesses")
          .update({ address: loc.address, maps_url: loc.mapsUrl })
          .eq("id", live!.id)
          .select()
          .single()
          .then(({ data: row }) => {
            if (row) setLive(row as BusinessRow);
          });
        return;
      }
      persistWs({ ...ws, location: loc });
    }

    function setPlan(p: Plan) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("businesses")
          .update({ plan: p })
          .eq("id", live!.id)
          .select()
          .single()
          .then(({ data: row }) => {
            if (row) setLive(row as BusinessRow);
          });
        return;
      }
      persistWs({ ...ws, plan: p });
    }

    function addService(s: Omit<Service, "id" | "bookings30d">) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("services")
          .insert({
            business_id: live!.id,
            name_tr: s.name.tr,
            name_en: s.name.en,
            duration_min: s.durationMin,
            price: s.price,
            deposit: s.deposit,
            color: s.color,
          })
          .then(() => refetchLive(live!.id));
        return;
      }
      const svc: Service = { ...s, id: `svc-${Date.now()}`, bookings30d: 0 };
      commit((prev) => ({ ...prev, services: [...prev.services, svc] }));
      log(business.owner, { tr: "hizmet ekledi:", en: "added service:" }, s.name.tr, "info");
    }

    function updateService(id: string, patch: Partial<Omit<Service, "id">>) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        const row: Record<string, unknown> = {};
        if (patch.name) {
          row.name_tr = patch.name.tr;
          row.name_en = patch.name.en;
        }
        if (patch.durationMin !== undefined) row.duration_min = patch.durationMin;
        if (patch.price !== undefined) row.price = patch.price;
        if (patch.deposit !== undefined) row.deposit = patch.deposit;
        if (patch.color !== undefined) row.color = patch.color;
        supabase.from("services").update(row).eq("id", id).then(() => refetchLive(live!.id));
        return;
      }
      commit((prev) => ({
        ...prev,
        services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    }

    function deleteService(id: string) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase.from("services").delete().eq("id", id).then(() => refetchLive(live!.id));
        return;
      }
      commit((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id),
        appointments: prev.appointments.filter((a) => a.serviceId !== id),
      }));
    }

    function addStaff(s: Omit<Staff, "id" | "initials" | "utilization" | "online">) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("staff")
          .insert({
            business_id: live!.id,
            name: s.name,
            role_tr: s.role.tr,
            role_en: s.role.en,
            initials: initialsOf(s.name),
            start_min: s.startMin,
            end_min: s.endMin,
            online: true,
          })
          .then(() => refetchLive(live!.id));
        return;
      }
      const member: Staff = { ...s, id: `stf-${Date.now()}`, initials: initialsOf(s.name), utilization: 0, online: true };
      commit((prev) => ({ ...prev, staff: [...prev.staff, member] }));
      log(business.owner, { tr: "personel ekledi:", en: "added staff:" }, s.name, "info");
    }

    function addAppointment(input: {
      client: string;
      clientPhone: string;
      serviceId: string;
      staffId: string;
      dayOffset: number;
      startMin: number;
    }) {
      const svc = data.services.find((s) => s.id === input.serviceId);
      if (!svc) return;

      if (isLive) {
        const supabase = supabaseRef.current!;
        (async () => {
          let clientId: string | null = null;
          const existing = data.clients.find((c) => c.phone === input.clientPhone);
          if (existing) {
            clientId = existing.id;
          } else {
            const { data: newClient } = await supabase
              .from("clients")
              .insert({ business_id: live!.id, name: input.client, phone: input.clientPhone, email: "" })
              .select()
              .single();
            clientId = newClient?.id ?? null;
          }
          await supabase.from("appointments").insert({
            business_id: live!.id,
            service_id: input.serviceId,
            staff_id: input.staffId,
            client_id: clientId,
            client_name: input.client,
            client_phone: input.clientPhone,
            starts_at: toStartsAtISO(input.dayOffset, input.startMin),
            duration_min: svc.durationMin,
            status: "booked",
            price: svc.price,
            source: "phone",
          });
          await refetchLive(live!.id);
        })();
        return;
      }

      const existing = data.clients.find((c) => c.name.toLocaleLowerCase("tr") === input.client.toLocaleLowerCase("tr"));
      const appt: Appointment = {
        id: `apt-${Date.now()}`,
        client: input.client,
        clientInitials: initialsOf(input.client),
        clientPhone: input.clientPhone,
        serviceId: input.serviceId,
        staffId: input.staffId,
        dayOffset: input.dayOffset,
        startMin: input.startMin,
        status: "booked",
        price: svc.price,
        paid: false,
        source: "phone",
        pastVisits: existing?.visits ?? 0,
      };
      commit((prev) => ({
        ...prev,
        appointments: [...prev.appointments, appt],
        clients: existing
          ? prev.clients
          : [
              {
                id: `cli-${Date.now()}`,
                name: input.client,
                initials: initialsOf(input.client),
                email: "",
                phone: input.clientPhone,
                visits: 0,
                spend: 0,
                lastVisit: new Date().toISOString().slice(0, 10),
                tag: "new" as const,
              },
              ...prev.clients,
            ],
      }));
      log(input.client, { tr: "randevu aldı:", en: "booked:" }, svc.name.tr, "success");
    }

    function setApptStatus(id: string, status: ApptStatus) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase.from("appointments").update({ status }).eq("id", id).then(() => refetchLive(live!.id));
        return;
      }
      commit((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      }));
    }

    function addClient(c: { name: string; phone: string; email: string }) {
      if (isLive) {
        const supabase = supabaseRef.current!;
        supabase
          .from("clients")
          .insert({ business_id: live!.id, name: c.name, phone: c.phone, email: c.email })
          .then(() => refetchLive(live!.id));
        return;
      }
      const client: Client = {
        id: `cli-${Date.now()}`,
        name: c.name,
        initials: initialsOf(c.name),
        email: c.email,
        phone: c.phone,
        visits: 0,
        spend: 0,
        lastVisit: new Date().toISOString().slice(0, 10),
        tag: "new",
      };
      commit((prev) => ({ ...prev, clients: [client, ...prev.clients] }));
      log(business.owner, { tr: "müşteri ekledi:", en: "added client:" }, c.name, "info");
    }

    return {
      ready,
      isDemo,
      business,
      setBusiness,
      location,
      setLocation,

      plan: isLive ? live!.plan : ws.plan,
      setPlan,
      planDef,
      atLeast: (required) => ORDER.indexOf(isLive ? live!.plan : ws.plan) >= ORDER.indexOf(required),
      canAddStaff: planDef.maxStaff === null || data.staff.length < planDef.maxStaff,
      canAddBooking:
        planDef.maxBookingsPerMonth === null || data.appointments.length < planDef.maxBookingsPerMonth,

      services: data.services,
      serviceById,
      addService,
      updateService,
      deleteService,

      staff: data.staff,
      staffById,
      addStaff,

      appointments: data.appointments,
      addAppointment,
      setApptStatus,

      clients: data.clients,
      addClient,

      activity: data.activity,
      bookingInfo: {
        business: business.name,
        tagline: isDemo ? demoBookingPage.tagline : ({ tr: business.category, en: business.category } as L),
        rating: isDemo ? demoBookingPage.rating : 5.0,
        reviews: isDemo ? demoBookingPage.reviews : 0,
        address: location.address,
        mapsUrl: location.mapsUrl,
        options: isDemo ? demoBookingPage.options : data.services.slice(0, 4).map((s) => s.id),
        slots: demoBookingPage.slots,
        url: `booky.app/book/${business.slug}`,
      },
    };
  }, [ready, ws, data, live, commit, log, persistWs, refetchLive]);

  return <WorkspaceContext.Provider value={value}>{ready ? children : null}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
