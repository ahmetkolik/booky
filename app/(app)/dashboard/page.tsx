"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  Phone,
  Clock,
  Star,
  Plus,
  CreditCard,
  CalendarCheck,
  Share2,
  Download,
} from "lucide-react";
import { Lock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { AreaChart, SegmentedBar } from "@/components/app/charts";
import { useLang } from "@/components/i18n/language-provider";
import { usePlan } from "@/components/app/plan-context";
import { cn, formatPrice, formatMoney, minutesToLabel, minutesToHHMM, formatDuration, formatRelative } from "@/lib/utils";
import {
  appointments,
  services,
  serviceById,
  staff,
  staffById,
  clients,
  CLIENT_TAG,
  kpis,
  revenue,
  sources,
  sourcesMeta,
  activity,
  upcoming,
  bookingPage,
  dayStartMin,
  dayEndMin,
  slotMin,
  SERVICE_VAR,
  STATUS_META,
  type Appointment,
  type ApptStatus,
} from "@/lib/demo/data";

function exportRevenueCSV(lang: "tr" | "en") {
  const header = lang === "tr"
    ? ["Gün", "Gelir (₺)", "Değişim (%)"]
    : ["Day", "Revenue (₺)", "Change (%)"];
  const rows = revenue.series.map((val, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const pct = prev ? (((val - prev) / prev) * 100).toFixed(1) : "";
    return [lang === "tr" ? `${i + 1}. gün` : `Day ${i + 1}`, val, pct];
  });
  const serviceRows = [
    [],
    lang === "tr" ? ["Hizmet", "Fiyat (₺)", "30g Rezerv.", "30g Gelir (₺)"] : ["Service", "Price (₺)", "30d Bookings", "30d Revenue (₺)"],
    ...services.map(s => [s.name[lang], s.price, s.bookings30d, s.price * s.bookings30d]),
  ];
  const csv = [[header, ...rows, ...serviceRows].map(r => r.join(",")).join("\n")];
  const blob = new Blob(csv, { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `booky-gelir-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

const DAY_LABELS: { tr: string; en: string }[] = [
  { tr: "Dün", en: "Yesterday" },
  { tr: "Bugün", en: "Today" },
  { tr: "Yarın", en: "Tomorrow" },
];

export default function DashboardPage() {
  const { t, lang } = useLang();
  const { atLeast } = usePlan();
  const canRevenue = atLeast("isletme");
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>("ap3");

  const dayAppts = useMemo(
    () => appointments.filter((a) => a.dayOffset === dayOffset).sort((a, b) => a.startMin - b.startMin),
    [dayOffset],
  );
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const drawerOpen = selected !== null;

  const dayLabel = DAY_LABELS[dayOffset + 1] ?? { tr: "Gün", en: "Day" };

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      <div className={cn("grid gap-6", drawerOpen ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* ── Main column ──────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {/* Page header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "Rezervasyon paneli" : "Booking cockpit"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Bugünün programı, gelir ve gelmeyen müşteriler — tek ekranda."
                  : "Today's schedule, revenue and no-shows — on one screen."}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted sm:inline-flex">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                {lang === "tr" ? "Rezervasyon linki" : "Booking link"}
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:px-3.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === "tr" ? "Randevu ekle" : "New booking"}</span>
              </button>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((k) => {
              const up = (k.delta ?? 0) >= 0;
              return (
                <div key={k.key} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={k.icon} className="h-[17px] w-[17px]" />
                    </span>
                    {k.delta !== undefined && (
                      <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-success" : "text-destructive")}>
                        {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(k.delta).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-3 tnum text-2xl font-bold leading-none text-foreground">{k.value}</p>
                  <p className="mt-1.5 text-[12.5px] font-medium text-foreground/80">{t(k.label)}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{t(k.hint)}</p>
                </div>
              );
            })}
          </div>

          {/* Day schedule (staff columns × time rows) */}
          <DaySchedule
            dayOffset={dayOffset}
            dayLabel={lang === "tr" ? dayLabel.tr : dayLabel.en}
            onPrev={() => setDayOffset((d) => Math.max(-1, d - 1))}
            onNext={() => setDayOffset((d) => Math.min(1, d + 1))}
            appts={dayAppts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            lang={lang}
            t={t}
          />

          {/* Appointments list */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Randevular" : "Appointments"}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {dayAppts.length}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                {(["booked", "checked-in", "done", "no-show"] as ApptStatus[]).map((s) => (
                  <span key={s} className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:inline-flex">
                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].dot }} />
                    {t(STATUS_META[s].label)}
                  </span>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Müşteri" : "Client"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Hizmet" : "Service"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Personel" : "Staff"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Saat" : "Time"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Tutar" : "Price"}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayAppts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        {lang === "tr" ? "Bu gün için randevu yok." : "No appointments on this day."}
                      </td>
                    </tr>
                  )}
                  {dayAppts.map((a) => {
                    const svc = serviceById(a.serviceId);
                    const stf = staffById(a.staffId);
                    const st = STATUS_META[a.status];
                    const isSel = a.id === selectedId;
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={a.clientInitials} />
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{a.client}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {a.pastVisits === 0
                                  ? lang === "tr" ? "yeni müşteri" : "new client"
                                  : `${a.pastVisits} ${lang === "tr" ? "ziyaret" : "visits"}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[svc.color] }} />
                            <span className="font-medium">{t(svc.name)}</span>
                          </span>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <span className="text-[13px] text-muted-foreground">{stf.name}</span>
                        </td>
                        <td className="py-3">
                          <span className="tnum whitespace-nowrap text-[13px] text-muted-foreground">
                            {minutesToHHMM(a.startMin)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", st.tone)}>
                            {t(st.label)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <p className="tnum font-semibold">{formatPrice(a.price)}</p>
                          <p className="tnum text-[10px] text-muted-foreground">
                            {a.paid ? (lang === "tr" ? "ödendi" : "paid") : (lang === "tr" ? "ödenmedi" : "unpaid")}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue + sources */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[15px] font-semibold tracking-tight">{t(revenue.meta.title)}</h3>
                  <p className="text-xs text-muted-foreground">{t(revenue.meta.subtitle)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => canRevenue ? exportRevenueCSV(lang) : undefined}
                    title={canRevenue ? (lang === "tr" ? "Excel/CSV indir" : "Download Excel/CSV") : (lang === "tr" ? "İşletme paketi gerekli" : "Business plan required")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium shadow-pill transition-colors",
                      canRevenue ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "cursor-not-allowed text-muted-foreground/40",
                    )}
                  >
                    {canRevenue ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    CSV
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <ArrowUpRight className="h-3 w-3" />
                    {revenue.meta.delta}
                  </span>
                </div>
              </div>
              <p className="mt-3 tnum text-2xl font-bold leading-none">{formatMoney(revenue.meta.total)}</p>

              {/* Detailed revenue table — İşletme only */}
              <div className="relative mt-4">
                <div className={cn("overflow-hidden rounded-xl border border-border", !canRevenue && "pointer-events-none select-none blur-[3px] opacity-60")}>
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="py-2 pl-3 text-left font-medium text-muted-foreground">{lang === "tr" ? "Gün" : "Day"}</th>
                        <th className="py-2 text-right font-medium text-muted-foreground">{lang === "tr" ? "Gelir" : "Revenue"}</th>
                        <th className="py-2 pr-3 text-right font-medium text-muted-foreground">{lang === "tr" ? "Değişim" : "Change"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.series.slice(-7).map((val, i, arr) => {
                        const prev = i > 0 ? arr[i - 1] : null;
                        const pct = prev ? ((val - prev) / prev) * 100 : null;
                        const up = pct !== null && pct >= 0;
                        return (
                          <tr key={i} className="border-b border-border/40 last:border-0">
                            <td className="py-1.5 pl-3 text-muted-foreground">
                              {lang === "tr" ? `${8 + i}. gün` : `Day ${8 + i}`}
                            </td>
                            <td className="tnum py-1.5 text-right font-semibold">{formatMoney(val)}</td>
                            <td className={cn("tnum py-1.5 pr-3 text-right text-[11px] font-medium", pct === null ? "text-muted-foreground" : up ? "text-success" : "text-destructive")}>
                              {pct === null ? "—" : `${up ? "+" : ""}${pct.toFixed(1)}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td className="py-2 pl-3 text-[11px] font-semibold">{lang === "tr" ? "14 günlük toplam" : "14-day total"}</td>
                        <td className="tnum py-2 text-right text-[12px] font-bold">{formatMoney(revenue.meta.total)}</td>
                        <td className="py-2 pr-3 text-right">
                          <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">{revenue.meta.delta}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {!canRevenue && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl">
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/90 px-5 py-4 text-center shadow-pop backdrop-blur-sm">
                      <Lock className="h-5 w-5 text-primary" />
                      <p className="text-[12px] font-semibold">{lang === "tr" ? "İşletme paketi gerekli" : "Business plan required"}</p>
                      <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Detaylı tablo & CSV export" : "Detailed table & CSV export"}</p>
                      <Link href="/#pricing" className="mt-1 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90">
                        {lang === "tr" ? "İşletme'ye geç →" : "Upgrade →"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Hizmet bazlı karlılık — İşletme only */}
              <div className="relative mt-4">
                <div className={cn(!canRevenue && "pointer-events-none select-none blur-[3px] opacity-60")}>
                  <p className="mb-2 text-[12px] font-semibold text-muted-foreground">{lang === "tr" ? "Hizmet bazlı karlılık (30 gün)" : "Per-service profitability (30d)"}</p>
                  <div className="space-y-1.5">
                    {services.slice(0, 4).map((s) => {
                      const total = s.price * s.bookings30d;
                      const maxTotal = Math.max(...services.map(sv => sv.price * sv.bookings30d));
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: SERVICE_VAR[s.color] }} />
                          <span className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground">{t(s.name)}</span>
                          <div className="flex w-32 items-center gap-1.5">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary/60" style={{ width: `${(total / maxTotal) * 100}%` }} />
                            </div>
                            <span className="tnum w-20 text-right text-[11px] font-semibold">{formatMoney(total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {!canRevenue && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/90 px-4 py-2.5 shadow-soft backdrop-blur-sm">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="text-[11.5px] font-semibold">{lang === "tr" ? "İşletme paketi — karlılık raporu" : "Business plan — profitability report"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">{t(sourcesMeta.title)}</h3>
              <p className="text-xs text-muted-foreground">{lang === "tr" ? "Son 30 gün" : "Last 30 days"}</p>
              <div className="mt-5">
                <SegmentedBar segments={sources.map((s) => ({ label: t(s.label), value: s.value, color: s.color }))} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniStat label={lang === "tr" ? "Doluluk" : "Utilization"} value="70%" />
                <MiniStat label={lang === "tr" ? "Ort. fiş" : "Avg ticket"} value="₺914" />
                <MiniStat label={lang === "tr" ? "No-show oranı" : "No-show rate"} value="%7" />
                <MiniStat label={lang === "tr" ? "Dep. tahsilat" : "Dep. captured"} value="₺650" />
              </div>
            </div>
          </div>

          {/* Services / staff panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Services */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Hizmetler" : "Services"}</h3>
                <button className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "tr" ? "Ekle" : "Add"}
                </button>
              </div>
              <div className="divide-y divide-border/60">
                {services.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="h-7 w-1.5 rounded-full" style={{ background: SERVICE_VAR[s.color] }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{t(s.name)}</p>
                      <p className="tnum text-[11px] text-muted-foreground">
                        {formatDuration(s.durationMin)}
                        {s.deposit > 0 && ` · ${lang === "tr" ? "depozito" : "deposit"} ${formatPrice(s.deposit)}`}
                      </p>
                    </div>
                    <span className="tnum text-sm font-semibold">{formatPrice(s.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff availability */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Personel" : "Staff"}</h3>
                <span className="text-[12px] text-muted-foreground">{lang === "tr" ? "bugünkü doluluk" : "today's load"}</span>
              </div>
              <div className="divide-y divide-border/60">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="relative">
                      <Avatar initials={s.initials} />
                      <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", s.online ? "bg-success" : "bg-muted-foreground/40")} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t(s.role)} · {minutesToHHMM(s.startMin)}–{minutesToHHMM(s.endMin)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.utilization}%` }} />
                      </div>
                      <span className="tnum w-8 text-right text-[12px] font-semibold text-muted-foreground">{s.utilization}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Müşteriler" : "Clients"}</h3>
              <Link href="/clients" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
                {lang === "tr" ? "Tümünü gör" : "View all"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "İsim" : "Name"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Etiket" : "Tag"}</th>
                    <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Ziyaret" : "Visits"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Harcama" : "Spend"}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 6).map((c) => {
                    const tag = CLIENT_TAG[c.tag];
                    return (
                      <tr key={c.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={c.initials} />
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{c.name}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", tag.tone)}>{t(tag.label)}</span>
                        </td>
                        <td className="tnum py-3 text-right text-muted-foreground">{c.visits}</td>
                        <td className="tnum py-3 pr-4 text-right font-semibold">{formatPrice(c.spend)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right drawer ─────────────────────────────────────────── */}
        {drawerOpen && selected && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm xl:hidden"
              onClick={() => setSelectedId(null)}
            />
          </>
        )}
        {drawerOpen && selected && (
          <aside className="fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-2xl drawer-anim xl:relative xl:bottom-auto xl:left-auto xl:right-auto xl:z-auto xl:max-h-none xl:rounded-none xl:sticky xl:top-2 xl:self-start">
            <AppointmentDrawer appt={selected} onClose={() => setSelectedId(null)} lang={lang} t={t} />

            {/* Upcoming / no-show panel */}
            <div className="mt-5 space-y-3">
              <UpcomingCard
                icon={<CalendarCheck className="h-4 w-4" />}
                tone="info"
                label={t(upcoming.reminders.label)}
                count={upcoming.reminders.count}
                sub={t(upcoming.reminders.sub)}
              />
              <UpcomingCard
                icon={<X className="h-4 w-4" />}
                tone="destructive"
                label={t(upcoming.noShows.label)}
                count={upcoming.noShows.count}
                sub={t(upcoming.noShows.sub)}
              />
              <UpcomingCard
                icon={<Clock className="h-4 w-4" />}
                tone="warning"
                label={t(upcoming.waitlist.label)}
                count={upcoming.waitlist.count}
                sub={t(upcoming.waitlist.sub)}
              />
            </div>

            {/* Booking-page preview */}
            <BookingPreview lang={lang} t={t} />

            {/* Activity feed */}
            <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Son hareketler" : "Recent activity"}
              </h3>
              <div className="mt-3.5 space-y-3.5">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        a.tone === "success" ? "bg-success" : a.tone === "warning" ? "bg-warning" : a.tone === "info" ? "bg-info" : "bg-muted-foreground",
                      )}
                    />
                    <div className="min-w-0 text-[13px]">
                      <p className="leading-snug">
                        <span className="font-semibold">{a.who}</span>{" "}
                        <span className="text-muted-foreground">{t(a.action)}</span>{" "}
                        <span className="font-medium">{a.target}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{formatRelative(a.at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── Sub-components ───────────────────────────── */

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-foreground/70 ring-1 ring-border"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 tnum text-lg font-bold leading-none">{value}</p>
    </div>
  );
}

function UpcomingCard({
  icon,
  tone,
  label,
  count,
  sub,
}: {
  icon: React.ReactNode;
  tone: "info" | "destructive" | "warning";
  label: string;
  count: number;
  sub: string;
}) {
  const toneCls =
    tone === "info" ? "bg-info/10 text-info" : tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <span className="tnum text-xl font-bold">{count}</span>
    </div>
  );
}

/* ── Day schedule grid (staff columns × time rows) ─────────────────────────── */
function DaySchedule({
  dayOffset,
  dayLabel,
  onPrev,
  onNext,
  appts,
  selectedId,
  onSelect,
  lang,
  t,
}: {
  dayOffset: number;
  dayLabel: string;
  onPrev: () => void;
  onNext: () => void;
  appts: Appointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  lang: "tr" | "en";
  t: (v: { tr: string; en: string }) => string;
}) {
  const rowH = 38; // px per slot
  const totalSlots = (dayEndMin - dayStartMin) / slotMin;
  const gridH = totalSlots * rowH;

  // Live "now" line — client-only (starts null so SSR markup matches), then
  // refreshes every 20s; CSS transitions the glide between updates.
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60);
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);
  const showNow = dayOffset === 0 && nowMin !== null && nowMin >= dayStartMin && nowMin <= dayEndMin;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
        <h2 className="font-display text-[15px] font-semibold tracking-tight">
          {lang === "tr" ? "Gün programı" : "Day schedule"}
        </h2>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={onPrev} aria-label="prev" className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[88px] text-center text-[13px] font-semibold">{dayLabel}</span>
          <button onClick={onNext} aria-label="next" className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* staff header — columns settle in one by one on first mount */}
          <div className="stagger grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${staff.length}, 1fr)` }}>
            <div />
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2.5">
                <Avatar initials={s.initials} size={26} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold leading-tight">{s.name.split(" ")[0]}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{t(s.role)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* grid body */}
          <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${staff.length}, 1fr)` }}>
            {/* live "now" line gliding down the day */}
            {showNow && (
              <div
                className="now-line pointer-events-none absolute inset-x-0 z-20"
                style={{ top: ((nowMin! - dayStartMin) / slotMin) * rowH }}
                aria-hidden
              >
                <div className="relative ml-14 border-t-[1.5px] border-primary/80">
                  <span className="absolute -left-1 -top-[4.5px] h-2 w-2 rounded-full bg-primary" />
                  <span className="absolute -top-2.5 right-1 rounded-full bg-primary px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wide text-primary-foreground">
                    {lang === "tr" ? "şimdi" : "now"}
                  </span>
                </div>
              </div>
            )}
            {/* time gutter */}
            <div className="relative" style={{ height: gridH }}>
              {Array.from({ length: totalSlots + 1 }).map((_, i) => {
                const min = dayStartMin + i * slotMin;
                const isHour = min % 60 === 0;
                return isHour ? (
                  <div key={i} className="absolute right-2 -translate-y-1/2 tnum text-[10px] text-muted-foreground" style={{ top: i * rowH }}>
                    {minutesToHHMM(min)}
                  </div>
                ) : null;
              })}
            </div>

            {/* staff columns */}
            {staff.map((s, ci) => {
              const colAppts = appts.filter((a) => a.staffId === s.id);
              return (
                <div key={s.id} className={cn("relative border-l border-border/60", ci === staff.length - 1 && "")} style={{ height: gridH }}>
                  {/* slot lines */}
                  {Array.from({ length: totalSlots }).map((_, i) => {
                    const min = dayStartMin + i * slotMin;
                    return (
                      <div
                        key={i}
                        className={cn("absolute inset-x-0 border-t", min % 60 === 0 ? "border-border/70" : "border-border/30")}
                        style={{ top: i * rowH, height: rowH }}
                      />
                    );
                  })}
                  {/* appointment blocks — staggered pop on first mount */}
                  {colAppts.map((a) => {
                    const svc = serviceById(a.serviceId);
                    const top = ((a.startMin - dayStartMin) / slotMin) * rowH;
                    const height = (svc.durationMin / slotMin) * rowH;
                    const color = SERVICE_VAR[svc.color];
                    const active = a.id === selectedId;
                    const faded = a.status === "no-show";
                    const order = appts.indexOf(a);
                    return (
                      <button
                        key={a.id}
                        onClick={() => onSelect(a.id)}
                        className={cn(
                          "animate-pop-soft absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left transition-all hover:z-10 hover:shadow-pop",
                          active ? "z-10 ring-2 ring-offset-1 ring-offset-card" : "",
                          faded && "opacity-55",
                        )}
                        style={{
                          top: top + 1,
                          height: Math.max(height - 2, 22),
                          background: `color-mix(in oklch, ${color} 13%, white)`,
                          borderColor: color,
                          animationDelay: `${120 + order * 45}ms`,
                          ...(active ? ({ "--tw-ring-color": color } as React.CSSProperties) : {}),
                        }}
                        title={`${a.client} · ${t(svc.name)}`}
                      >
                        <p className="truncate text-[11px] font-semibold leading-tight" style={{ color: `color-mix(in oklch, ${color} 70%, black)` }}>
                          {a.client}
                        </p>
                        {height > 30 && (
                          <p className="truncate text-[10px] text-foreground/60">{t(svc.name)}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Appointment detail drawer ─────────────────────────────────────────────── */
function AppointmentDrawer({
  appt,
  onClose,
  lang,
  t,
}: {
  appt: Appointment;
  onClose: () => void;
  lang: "tr" | "en";
  t: (v: { tr: string; en: string }) => string;
}) {
  const svc = serviceById(appt.serviceId);
  const stf = staffById(appt.staffId);
  const st = STATUS_META[appt.status];
  const endMin = appt.startMin + svc.durationMin;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold tracking-tight">
          {lang === "tr" ? "Randevu detayı" : "Appointment"}
        </h2>
        <button
          onClick={onClose}
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Client */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
          {appt.clientInitials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{appt.client}</p>
          <p className="tnum truncate text-[11px] text-muted-foreground">{appt.clientPhone}</p>
        </div>
        <a href={`tel:${appt.clientPhone.replace(/\s/g, "")}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Phone className="h-4 w-4" />
        </a>
      </div>

      {/* Service + time */}
      <div className="space-y-2.5">
        <Row label={lang === "tr" ? "Hizmet" : "Service"}>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[svc.color] }} />
            {t(svc.name)}
          </span>
        </Row>
        <Row label={lang === "tr" ? "Personel" : "Staff"}>{stf.name}</Row>
        <Row label={lang === "tr" ? "Saat" : "Time"}>
          <span className="tnum">{minutesToLabel(appt.startMin)} – {minutesToLabel(endMin)}</span>
        </Row>
        <Row label={lang === "tr" ? "Süre" : "Duration"}>
          <span className="tnum">{formatDuration(svc.durationMin)}</span>
        </Row>
        <Row label={lang === "tr" ? "Durum" : "Status"}>
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", st.tone)}>{t(st.label)}</span>
        </Row>
        <Row label={lang === "tr" ? "Kaynak" : "Source"}>
          <span className="capitalize text-muted-foreground">{appt.source}</span>
        </Row>
      </div>

      {appt.note && (
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="label-mono text-muted-foreground">{lang === "tr" ? "Not" : "Note"}</p>
          <p className="mt-1 text-[13px]">{t(appt.note)}</p>
        </div>
      )}

      {/* History + payment */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-3">
          <p className="label-mono text-muted-foreground">{lang === "tr" ? "Geçmiş" : "History"}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Star className="h-3.5 w-3.5 text-warning" />
            {appt.pastVisits} {lang === "tr" ? "ziyaret" : "visits"}
          </p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="label-mono text-muted-foreground">{lang === "tr" ? "Ödeme" : "Payment"}</p>
          <p className={cn("mt-1.5 flex items-center gap-1.5 text-sm font-semibold", appt.paid ? "text-success" : "text-warning-foreground")}>
            <CreditCard className="h-3.5 w-3.5" />
            {appt.paid ? (lang === "tr" ? "Ödendi" : "Paid") : (lang === "tr" ? "Bekliyor" : "Pending")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
        <span className="text-[13px] text-muted-foreground">{lang === "tr" ? "Toplam" : "Total"}</span>
        <span className="tnum text-lg font-bold">{formatPrice(appt.price)}</span>
      </div>

      {appt.status === "booked" || appt.status === "checked-in" ? (
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Check className="h-4 w-4" />
          {appt.status === "booked" ? (lang === "tr" ? "Geldi olarak işaretle" : "Check in") : (lang === "tr" ? "Tamamlandı işaretle" : "Mark done")}
        </button>
      ) : (
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted">
          {lang === "tr" ? "Yeniden rezerve et" : "Rebook"}
        </button>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/* ── Public booking-page preview (a mini widget) ───────────────────────────── */
function BookingPreview({ lang, t }: { lang: "tr" | "en"; t: (v: { tr: string; en: string }) => string }) {
  const opts = bookingPage.options.map(serviceById);
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Rezervasyon sayfası" : "Booking page"}</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          {lang === "tr" ? "yayında" : "live"}
        </span>
      </div>
      <div className="p-4">
        {/* business header mock */}
        <div className="rounded-xl p-3.5 text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
          <p className="font-display text-base font-bold leading-tight">{bookingPage.business}</p>
          <p className="text-[11px] text-white/80">{t(bookingPage.tagline)}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/90">
            <Star className="h-3 w-3 fill-white text-white" />
            {bookingPage.rating} · {bookingPage.reviews} {lang === "tr" ? "yorum" : "reviews"}
          </p>
        </div>
        {/* service options */}
        <p className="mt-3 label-mono text-muted-foreground">{lang === "tr" ? "Hizmet seç" : "Pick a service"}</p>
        <div className="mt-1.5 space-y-1.5">
          {opts.slice(0, 3).map((s, i) => (
            <div key={s.id} className={cn("flex items-center gap-2.5 rounded-lg border px-2.5 py-2", i === 0 ? "border-primary/40 bg-primary/[0.05]" : "border-border")}>
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[s.color] }} />
              <span className="flex-1 text-[12.5px] font-medium">{t(s.name)}</span>
              <span className="tnum text-[12px] text-muted-foreground">{formatDuration(s.durationMin)}</span>
              <span className="tnum text-[12.5px] font-semibold">{formatPrice(s.price)}</span>
            </div>
          ))}
        </div>
        {/* slots */}
        <p className="mt-3 label-mono text-muted-foreground">{lang === "tr" ? "Uygun saatler" : "Open times"}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {bookingPage.slots.map((m, i) => (
            <span key={m} className={cn("tnum rounded-md border px-2 py-1 text-[12px]", i === 1 ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground")}>
              {minutesToHHMM(m)}
            </span>
          ))}
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
          {lang === "tr" ? "Rezerve et" : "Book now"}
        </button>
      </div>
    </div>
  );
}
