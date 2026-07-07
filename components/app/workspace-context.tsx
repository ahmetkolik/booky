"use client";

/**
 * Workspace layer — decides what the panel shows.
 *
 * Two modes:
 *  - "demo":  seeded from lib/demo/data (Studio Lumière). Entered via
 *             "Continue with demo" or logging in without a workspace.
 *  - "fresh": created by the signup → onboarding flow. Starts with ZERO
 *             data — the owner adds their own services, staff and bookings.
 *
 * The workspace (mode, business, plan, location) lives in localStorage; fresh
 * collections persist there too so the owner's entries survive reloads. Demo
 * edits are session-only — a reload resets the showcase.
 *
 * Plan rights come from lib/stripe/plans (maxStaff, maxBookingsPerMonth) and
 * are enforced by canAddStaff / canAddBooking. In production Stripe webhooks
 * would set `plan`; here signup?plan=X carries it through onboarding.
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
  type Staff,
  type Appointment,
  type ApptStatus,
  type Client,
  type DActivity,
} from "@/lib/demo/data";
import { PLAN_BY_ID, type Plan as PlanDef } from "@/lib/stripe/plans";
import type { L } from "@/lib/i18n/config";

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

/** Creates a brand-new empty workspace — the "start from zero" path. */
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
  const modeRef = useRef<"demo" | "fresh">("demo");

  // Load persisted workspace after mount (SSR renders nothing until ready).
  // setTimeout, not rAF: browsers pause rAF for occluded windows, which would
  // leave the panel blank until the tab becomes visible again.
  useEffect(() => {
    const id = setTimeout(() => {
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
          setWs(merged);
          modeRef.current = merged.mode;
          if (merged.mode === "fresh") {
            const rawData = localStorage.getItem(DATA_KEY);
            setData(rawData ? { ...EMPTY_COLLECTIONS, ...(JSON.parse(rawData) as Collections) } : EMPTY_COLLECTIONS);
          }
        }
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

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
    const planDef = PLAN_BY_ID[ws.plan];
    const isDemo = ws.mode === "demo";

    const serviceById = (id: string) => data.services.find((s) => s.id === id)!;
    const staffById = (id: string) => data.staff.find((s) => s.id === id)!;

    return {
      ready,
      isDemo,
      business: ws.business,
      location: ws.location,
      setLocation: (loc) => persistWs({ ...ws, location: loc }),

      plan: ws.plan,
      setPlan: (p) => persistWs({ ...ws, plan: p }),
      planDef,
      atLeast: (required) => ORDER.indexOf(ws.plan) >= ORDER.indexOf(required),
      canAddStaff: planDef.maxStaff === null || data.staff.length < planDef.maxStaff,
      canAddBooking:
        planDef.maxBookingsPerMonth === null || data.appointments.length < planDef.maxBookingsPerMonth,

      services: data.services,
      serviceById,
      addService: (s) => {
        const svc: Service = { ...s, id: `svc-${Date.now()}`, bookings30d: 0 };
        commit((prev) => ({ ...prev, services: [...prev.services, svc] }));
        log(ws.business.owner, { tr: "hizmet ekledi:", en: "added service:" }, s.name.tr, "info");
      },
      updateService: (id, patch) =>
        commit((prev) => ({
          ...prev,
          services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteService: (id) =>
        commit((prev) => ({
          ...prev,
          services: prev.services.filter((s) => s.id !== id),
          appointments: prev.appointments.filter((a) => a.serviceId !== id),
        })),

      staff: data.staff,
      staffById,
      addStaff: (s) => {
        const member: Staff = { ...s, id: `stf-${Date.now()}`, initials: initialsOf(s.name), utilization: 0, online: true };
        commit((prev) => ({ ...prev, staff: [...prev.staff, member] }));
        log(ws.business.owner, { tr: "personel ekledi:", en: "added staff:" }, s.name, "info");
      },

      appointments: data.appointments,
      addAppointment: ({ client, clientPhone, serviceId, staffId, dayOffset, startMin }) => {
        const svc = data.services.find((s) => s.id === serviceId);
        if (!svc) return;
        const existing = data.clients.find((c) => c.name.toLocaleLowerCase("tr") === client.toLocaleLowerCase("tr"));
        const appt: Appointment = {
          id: `apt-${Date.now()}`,
          client,
          clientInitials: initialsOf(client),
          clientPhone,
          serviceId,
          staffId,
          dayOffset,
          startMin,
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
                  name: client,
                  initials: initialsOf(client),
                  email: "",
                  phone: clientPhone,
                  visits: 0,
                  spend: 0,
                  lastVisit: new Date().toISOString().slice(0, 10),
                  tag: "new" as const,
                },
                ...prev.clients,
              ],
        }));
        log(client, { tr: "randevu aldı:", en: "booked:" }, svc.name.tr, "success");
      },
      setApptStatus: (id, status) =>
        commit((prev) => ({
          ...prev,
          appointments: prev.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      clients: data.clients,
      addClient: ({ name, phone, email }) => {
        const c: Client = {
          id: `cli-${Date.now()}`,
          name,
          initials: initialsOf(name),
          email,
          phone,
          visits: 0,
          spend: 0,
          lastVisit: new Date().toISOString().slice(0, 10),
          tag: "new",
        };
        commit((prev) => ({ ...prev, clients: [c, ...prev.clients] }));
        log(ws.business.owner, { tr: "müşteri ekledi:", en: "added client:" }, name, "info");
      },

      activity: data.activity,
      bookingInfo: isDemo
        ? {
            business: demoBookingPage.business,
            tagline: demoBookingPage.tagline,
            rating: demoBookingPage.rating,
            reviews: demoBookingPage.reviews,
            address: ws.location.address,
            mapsUrl: ws.location.mapsUrl,
            options: demoBookingPage.options,
            slots: demoBookingPage.slots,
            url: `booky.app/book/${ws.business.slug}`,
          }
        : {
            business: ws.business.name,
            tagline: { tr: ws.business.category, en: ws.business.category },
            rating: 5.0,
            reviews: 0,
            address: ws.location.address,
            mapsUrl: ws.location.mapsUrl,
            options: data.services.slice(0, 4).map((s) => s.id),
            slots: demoBookingPage.slots,
            url: `booky.app/book/${ws.business.slug}`,
          },
    };
  }, [ready, ws, data, commit, log, persistWs]);

  return (
    <WorkspaceContext.Provider value={value}>
      {ready ? children : null}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
