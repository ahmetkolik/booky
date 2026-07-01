/**
 * Demo data — what makes Booky feel alive with zero API keys. Labels are
 * bilingual ({ tr, en }); the dashboard resolves them to the active language.
 * Proper nouns and free text (client names, emails) stay as-is. Replace with
 * real queries once setup wires Supabase / Stripe / your calendar.
 *
 * The shape models an appointment-booking business: services, staff, clients,
 * and a day of appointments laid out on a staff × time grid.
 */
import type { L } from "@/lib/i18n/config";

/* ── Services ───────────────────────────────────────────────────────────────
   Each service has a duration, a price, and a color key that drives the block
   color on the day schedule and the legend everywhere. */
export type ServiceColor = "hair" | "color" | "spa" | "nail" | "train" | "clinic";

export interface Service {
  id: string;
  name: L;
  durationMin: number;
  price: number;
  color: ServiceColor;
  /** Required deposit to hold the slot (0 = none). */
  deposit: number;
  bookings30d: number;
}

export const SERVICE_VAR: Record<ServiceColor, string> = {
  hair: "var(--svc-hair)",
  color: "var(--svc-color)",
  spa: "var(--svc-spa)",
  nail: "var(--svc-nail)",
  train: "var(--svc-train)",
  clinic: "var(--svc-clinic)",
};

export const services: Service[] = [
  { id: "s1", name: { tr: "Saç kesimi & şekillendirme", en: "Haircut & style" }, durationMin: 45, price: 850, color: "hair", deposit: 200, bookings30d: 184 },
  { id: "s2", name: { tr: "Saç boyama", en: "Color & gloss" }, durationMin: 90, price: 1600, color: "color", deposit: 400, bookings30d: 96 },
  { id: "s3", name: { tr: "Sakal tıraşı", en: "Beard trim" }, durationMin: 20, price: 300, color: "hair", deposit: 0, bookings30d: 142 },
  { id: "s4", name: { tr: "Masaj (60 dk)", en: "Massage (60 min)" }, durationMin: 60, price: 950, color: "spa", deposit: 250, bookings30d: 71 },
  { id: "s5", name: { tr: "Manikür", en: "Manicure" }, durationMin: 40, price: 450, color: "nail", deposit: 100, bookings30d: 118 },
  { id: "s6", name: { tr: "Kişisel antrenman", en: "Personal training" }, durationMin: 60, price: 800, color: "train", deposit: 200, bookings30d: 88 },
  { id: "s7", name: { tr: "Cilt bakımı konsültasyonu", en: "Skin consult" }, durationMin: 30, price: 750, color: "clinic", deposit: 200, bookings30d: 44 },
];

export function serviceById(id: string) {
  return services.find((s) => s.id === id)!;
}

/* ── Staff ──────────────────────────────────────────────────────────────────
   Columns on the day schedule. Each has a role, working window and a load. */
export interface Staff {
  id: string;
  name: string;
  initials: string;
  role: L;
  /** Working window in minutes from midnight. */
  startMin: number;
  endMin: number;
  /** Today's utilization (%). */
  utilization: number;
  online: boolean;
}

export const staff: Staff[] = [
  { id: "st1", name: "Selin Aydın", initials: "SA", role: { tr: "Kıdemli stilist", en: "Senior stylist" }, startMin: 9 * 60, endMin: 18 * 60, utilization: 86, online: true },
  { id: "st2", name: "Mert Kaya", initials: "MK", role: { tr: "Berber", en: "Barber" }, startMin: 9 * 60, endMin: 17 * 60, utilization: 74, online: true },
  { id: "st3", name: "Aylin Demir", initials: "AD", role: { tr: "Terapist", en: "Therapist" }, startMin: 10 * 60, endMin: 18 * 60, utilization: 62, online: true },
  { id: "st4", name: "Cem Yıldız", initials: "CY", role: { tr: "Antrenör", en: "Trainer" }, startMin: 8 * 60, endMin: 16 * 60, utilization: 58, online: false },
];

export function staffById(id: string) {
  return staff.find((s) => s.id === id)!;
}

/* ── Schedule window (the day grid bounds) ──────────────────────────────────── */
export const dayStartMin = 8 * 60; // 08:00
export const dayEndMin = 19 * 60; // 19:00
export const slotMin = 30; // grid row granularity

/* ── Appointments ───────────────────────────────────────────────────────────
   The live list + grid blocks. `startMin` is minutes from midnight on the
   selected day; `dayOffset` lets a few rows fall on adjacent days so the day
   nav has something to switch to. */
export type ApptStatus = "booked" | "checked-in" | "done" | "no-show";

export interface Appointment {
  id: string;
  client: string;
  clientInitials: string;
  clientPhone: string;
  serviceId: string;
  staffId: string;
  /** Day offset from "today" (0 = today, -1 yesterday, 1 tomorrow). */
  dayOffset: number;
  startMin: number;
  status: ApptStatus;
  price: number;
  paid: boolean;
  /** "online" booking page, "walk-in", or "phone". */
  source: "online" | "walk-in" | "phone";
  /** Visits before this one. */
  pastVisits: number;
  note?: L;
}

export const STATUS_META: Record<ApptStatus, { label: L; tone: string; dot: string }> = {
  booked: { label: { tr: "rezerve", en: "booked" }, tone: "text-info bg-info/10", dot: "var(--color-info)" },
  "checked-in": { label: { tr: "geldi", en: "checked-in" }, tone: "text-primary bg-primary/10", dot: "var(--color-primary)" },
  done: { label: { tr: "tamamlandı", en: "done" }, tone: "text-success bg-success/10", dot: "var(--color-success)" },
  "no-show": { label: { tr: "gelmedi", en: "no-show" }, tone: "text-destructive bg-destructive/10", dot: "var(--color-destructive)" },
};

export const appointments: Appointment[] = [
  { id: "ap1", client: "Elif Şahin", clientInitials: "EŞ", clientPhone: "+90 532 110 4421", serviceId: "s1", staffId: "st1", dayOffset: 0, startMin: 9 * 60, status: "done", price: 850, paid: true, source: "online", pastVisits: 7, note: { tr: "Yanları kısa istiyor.", en: "Likes the sides short." } },
  { id: "ap2", client: "Burak Öz", clientInitials: "BÖ", clientPhone: "+90 535 220 8830", serviceId: "s3", staffId: "st2", dayOffset: 0, startMin: 9 * 60 + 30, status: "done", price: 300, paid: true, source: "walk-in", pastVisits: 3 },
  { id: "ap3", client: "Deniz Arslan", clientInitials: "DA", clientPhone: "+90 530 441 2210", serviceId: "s2", staffId: "st1", dayOffset: 0, startMin: 10 * 60, status: "checked-in", price: 1600, paid: true, source: "online", pastVisits: 12, note: { tr: "Köklere dikkat — alerji geçmişi yok.", en: "Watch the roots — no allergy history." } },
  { id: "ap4", client: "Zeynep Korkmaz", clientInitials: "ZK", clientPhone: "+90 538 902 1144", serviceId: "s4", staffId: "st3", dayOffset: 0, startMin: 10 * 60 + 30, status: "checked-in", price: 950, paid: false, source: "online", pastVisits: 5 },
  { id: "ap5", client: "Kerem Aslan", clientInitials: "KA", clientPhone: "+90 533 700 5512", serviceId: "s6", staffId: "st4", dayOffset: 0, startMin: 11 * 60, status: "booked", price: 800, paid: true, source: "online", pastVisits: 21, note: { tr: "Alt vücut günü.", en: "Lower-body day." } },
  { id: "ap6", client: "Naz Yılmaz", clientInitials: "NY", clientPhone: "+90 536 318 7740", serviceId: "s5", staffId: "st3", dayOffset: 0, startMin: 12 * 60, status: "booked", price: 450, paid: false, source: "online", pastVisits: 2 },
  { id: "ap7", client: "Ahmet Çelik", clientInitials: "AÇ", clientPhone: "+90 532 555 9081", serviceId: "s1", staffId: "st1", dayOffset: 0, startMin: 12 * 60 + 30, status: "booked", price: 850, paid: true, source: "phone", pastVisits: 9 },
  { id: "ap8", client: "Sıla Demir", clientInitials: "SD", clientPhone: "+90 535 642 3320", serviceId: "s3", staffId: "st2", dayOffset: 0, startMin: 13 * 60, status: "booked", price: 300, paid: false, source: "online", pastVisits: 0, note: { tr: "İlk ziyaret.", en: "First visit." } },
  { id: "ap9", client: "Onur Kılıç", clientInitials: "OK", clientPhone: "+90 530 904 6651", serviceId: "s7", staffId: "st3", dayOffset: 0, startMin: 14 * 60, status: "booked", price: 750, paid: true, source: "online", pastVisits: 1 },
  { id: "ap10", client: "Ece Polat", clientInitials: "EP", clientPhone: "+90 538 233 1190", serviceId: "s2", staffId: "st1", dayOffset: 0, startMin: 14 * 60 + 30, status: "booked", price: 1600, paid: true, source: "online", pastVisits: 6 },
  { id: "ap11", client: "Tolga Ak", clientInitials: "TA", clientPhone: "+90 533 118 7702", serviceId: "s6", staffId: "st4", dayOffset: 0, startMin: 13 * 60, status: "no-show", price: 800, paid: false, source: "online", pastVisits: 4 },
  { id: "ap12", client: "Pınar Güneş", clientInitials: "PG", clientPhone: "+90 536 770 2231", serviceId: "s4", staffId: "st3", dayOffset: 0, startMin: 15 * 60 + 30, status: "booked", price: 950, paid: true, source: "online", pastVisits: 8 },
  { id: "ap13", client: "Barış Yatağan", clientInitials: "BY", clientPhone: "+90 532 449 1187", serviceId: "s3", staffId: "st2", dayOffset: 0, startMin: 15 * 60, status: "booked", price: 300, paid: false, source: "walk-in", pastVisits: 11 },
  { id: "ap14", client: "Melis Acar", clientInitials: "MA", clientPhone: "+90 535 661 3309", serviceId: "s1", staffId: "st1", dayOffset: 0, startMin: 16 * 60 + 30, status: "booked", price: 850, paid: true, source: "online", pastVisits: 14 },
  // adjacent days (so the day nav has content)
  { id: "ap15", client: "Hakan Şen", clientInitials: "HŞ", clientPhone: "+90 533 200 4410", serviceId: "s6", staffId: "st4", dayOffset: 1, startMin: 9 * 60, status: "booked", price: 800, paid: true, source: "online", pastVisits: 3 },
  { id: "ap16", client: "Defne Toprak", clientInitials: "DT", clientPhone: "+90 536 884 2218", serviceId: "s2", staffId: "st1", dayOffset: 1, startMin: 11 * 60, status: "booked", price: 1600, paid: true, source: "online", pastVisits: 5 },
  { id: "ap17", client: "Yusuf Eren", clientInitials: "YE", clientPhone: "+90 532 071 9923", serviceId: "s3", staffId: "st2", dayOffset: -1, startMin: 10 * 60, status: "done", price: 300, paid: true, source: "walk-in", pastVisits: 6 },
];

/* ── Stat row (today) ───────────────────────────────────────────────────────── */
export interface DKpi {
  key: string;
  label: L;
  value: string;
  delta?: number;
  icon: string;
  hint: L;
}

export const kpis: DKpi[] = [
  { key: "bookings", label: { tr: "Bugünkü randevu", en: "Bookings today" }, value: "14", delta: 9.2, icon: "calendar-check", hint: { tr: "dün 12", en: "12 yesterday" } },
  { key: "revenue", label: { tr: "Günlük gelir", en: "Revenue" }, value: "₺12.850", delta: 14.6, icon: "dollar-sign", hint: { tr: "geçen haftaya göre", en: "vs last week" } },
  { key: "utilization", label: { tr: "Doluluk", en: "Utilization" }, value: "70%", delta: 4.1, icon: "gauge", hint: { tr: "4 personel ort.", en: "avg of 4 staff" } },
  { key: "clients", label: { tr: "Yeni müşteri", en: "New clients" }, value: "5", delta: -2.0, icon: "user-plus", hint: { tr: "bu hafta", en: "this week" } },
];

/* ── Revenue over time ──────────────────────────────────────────────────────── */
export const revenue = {
  meta: {
    title: { tr: "Gelir", en: "Revenue" } as L,
    subtitle: { tr: "Son 14 gün", en: "Last 14 days" } as L,
    delta: "+14.6%",
    total: 152800,
  },
  series: [7800, 9400, 7200, 10800, 10200, 8400, 13600, 14200, 11800, 10600, 14400, 12400, 11800, 12850],
  labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
};

/* ── Booking sources (segmented) ────────────────────────────────────────────── */
export const sourcesMeta = { title: { tr: "Rezervasyon kaynağı", en: "Booking source" } as L };
export const sources: { label: L; value: number; color: string }[] = [
  { label: { tr: "Booking sayfası", en: "Booking page" }, value: 62, color: "var(--seg-1)" },
  { label: { tr: "Tekrar müşteri", en: "Returning" }, value: 24, color: "var(--seg-3)" },
  { label: { tr: "Yürüyen", en: "Walk-in" }, value: 9, color: "var(--seg-4)" },
  { label: { tr: "Telefon", en: "Phone" }, value: 5, color: "var(--seg-2)" },
];

/* ── Clients ────────────────────────────────────────────────────────────────── */
export interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  visits: number;
  spend: number;
  lastVisit: string;
  tag: "vip" | "regular" | "new" | "lapsed";
}

export const CLIENT_TAG: Record<Client["tag"], { label: L; tone: string }> = {
  vip: { label: { tr: "VIP", en: "VIP" }, tone: "text-primary bg-primary/10" },
  regular: { label: { tr: "düzenli", en: "regular" }, tone: "text-info bg-info/10" },
  new: { label: { tr: "yeni", en: "new" }, tone: "text-success bg-success/10" },
  lapsed: { label: { tr: "uzak", en: "lapsed" }, tone: "text-warning-foreground bg-warning/15" },
};

export const clients: Client[] = [
  { id: "c1", name: "Elif Şahin", initials: "EŞ", email: "elif@example.com", phone: "+90 532 110 4421", visits: 8, spend: 7200, lastVisit: "2026-06-14", tag: "vip" },
  { id: "c2", name: "Kerem Aslan", initials: "KA", email: "kerem@example.com", phone: "+90 533 700 5512", visits: 22, spend: 21600, lastVisit: "2026-06-14", tag: "vip" },
  { id: "c3", name: "Deniz Arslan", initials: "DA", email: "deniz@example.com", phone: "+90 530 441 2210", visits: 13, spend: 24800, lastVisit: "2026-06-14", tag: "vip" },
  { id: "c4", name: "Ahmet Çelik", initials: "AÇ", email: "ahmet@example.com", phone: "+90 532 555 9081", visits: 10, spend: 8500, lastVisit: "2026-06-12", tag: "regular" },
  { id: "c5", name: "Pınar Güneş", initials: "PG", email: "pinar@example.com", phone: "+90 536 770 2231", visits: 9, spend: 9500, lastVisit: "2026-06-11", tag: "regular" },
  { id: "c6", name: "Sıla Demir", initials: "SD", email: "sila@example.com", phone: "+90 535 642 3320", visits: 1, spend: 300, lastVisit: "2026-06-14", tag: "new" },
  { id: "c7", name: "Onur Kılıç", initials: "OK", email: "onur@example.com", phone: "+90 530 904 6651", visits: 2, spend: 1600, lastVisit: "2026-06-14", tag: "new" },
  { id: "c8", name: "Tolga Ak", initials: "TA", email: "tolga@example.com", phone: "+90 533 118 7702", visits: 5, spend: 4800, lastVisit: "2026-05-02", tag: "lapsed" },
];

/* ── Upcoming / no-show panel ───────────────────────────────────────────────── */
export const upcoming = {
  reminders: {
    label: { tr: "Yarınki hatırlatmalar", en: "Tomorrow's reminders" } as L,
    count: 9,
    sub: { tr: "SMS + e-posta · 18:00'de gönderilir", en: "SMS + email · sent at 6:00 PM" } as L,
  },
  noShows: {
    label: { tr: "Bu hafta gelmeyen", en: "No-shows this week" } as L,
    count: 3,
    recovered: 2,
    sub: { tr: "2 depozito tahsil edildi", en: "2 deposits captured" } as L,
  },
  waitlist: {
    label: { tr: "Bekleme listesi", en: "Waitlist" } as L,
    count: 4,
    sub: { tr: "iptal olursa otomatik teklif", en: "auto-offered on cancellation" } as L,
  },
};

/* ── Public booking-page preview ────────────────────────────────────────────── */
export const bookingPage = {
  business: "Studio Lumière",
  tagline: { tr: "Güzellik & bakım · İstanbul", en: "Beauty & care · Istanbul" } as L,
  rating: 4.9,
  reviews: 312,
  /** Service options the public widget offers. */
  options: ["s1", "s2", "s4", "s5"],
  /** Open slots for the picked day (minutes from midnight). */
  slots: [9 * 60, 10 * 60 + 30, 11 * 60, 13 * 60, 14 * 60 + 30, 16 * 60],
};

/* ── Recent activity feed ───────────────────────────────────────────────────── */
export interface DActivity {
  id: string;
  who: string;
  action: L;
  target: string;
  at: string;
  tone: "neutral" | "success" | "warning" | "info";
}

export const activity: DActivity[] = [
  { id: "a1", who: "Elif Şahin", action: { tr: "online rezervasyon:", en: "booked online:" }, target: "Color & gloss", at: "2026-06-14T09:42:00Z", tone: "success" },
  { id: "a2", who: "Tolga Ak", action: { tr: "gelmedi —", en: "no-show —" }, target: "deposit captured", at: "2026-06-14T13:05:00Z", tone: "warning" },
  { id: "a3", who: "Sıla Demir", action: { tr: "ilk randevu:", en: "first booking:" }, target: "Beard trim", at: "2026-06-14T08:20:00Z", tone: "info" },
  { id: "a4", who: "Kerem Aslan", action: { tr: "depozito ödedi:", en: "paid deposit:" }, target: "$15", at: "2026-06-14T07:55:00Z", tone: "success" },
  { id: "a5", who: "System", action: { tr: "hatırlatma gönderdi:", en: "sent reminders:" }, target: "9 clients", at: "2026-06-14T06:00:00Z", tone: "neutral" },
];

/* ── Plan gate (demo only) ───────────────────────────────────────────────────
   Switch DEMO_PLAN to test different permission tiers in the UI.
   In production this comes from the Stripe subscription record. */
export type Plan = "solo" | "pro" | "isletme";
export const DEMO_PLAN: Plan = "pro";

export const PLAN_LABEL: Record<Plan, { tr: string; en: string }> = {
  solo:     { tr: "Solo",     en: "Solo" },
  pro:      { tr: "Pro",      en: "Pro" },
  isletme:  { tr: "İşletme",  en: "Business" },
};

/** Returns true when the active plan is at or above the required tier. */
export function planAtLeast(required: Plan): boolean {
  const order: Plan[] = ["solo", "pro", "isletme"];
  return order.indexOf(DEMO_PLAN) >= order.indexOf(required);
}

/* ── Interactive landing demo data ──────────────────────────────────────────── */
export const demoServices = ["s1", "s4", "s5"];
export const demoSlots = [
  { min: 10 * 60, label: "10:00" },
  { min: 11 * 60 + 30, label: "11:30" },
  { min: 14 * 60, label: "14:00" },
  { min: 16 * 60, label: "16:00" },
];
