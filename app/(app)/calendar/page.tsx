"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, minutesToHHMM, minutesToLabel, formatDuration, formatPrice } from "@/lib/utils";
import {
  appointments,
  serviceById,
  staff,
  staffById,
  services,
  dayStartMin,
  dayEndMin,
  slotMin,
  SERVICE_VAR,
  STATUS_META,
  type Appointment,
} from "@/lib/demo/data";

const DAY_LABELS = [
  { tr: "Dün", en: "Yesterday" },
  { tr: "Bugün", en: "Today" },
  { tr: "Yarın", en: "Tomorrow" },
];

export default function CalendarPage() {
  const { t, lang } = useLang();
  const [dayOffset, setDayOffset] = useState(0);
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<Appointment | null>(null);

  const visibleStaff = staffFilter ? staff.filter((s) => s.id === staffFilter) : staff;
  const dayAppts = useMemo(
    () => appointments.filter((a) => a.dayOffset === dayOffset),
    [dayOffset],
  );
  const dayLabel = DAY_LABELS[dayOffset + 1] ?? { tr: "Gün", en: "Day" };

  const rowH = 46;
  const totalSlots = (dayEndMin - dayStartMin) / slotMin;
  const gridH = totalSlots * rowH;

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Takvim" : "Calendar"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr" ? "Personel sütunları, hizmete göre renkli bloklar." : "Staff columns, blocks colored by service."}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-pill">
            <button onClick={() => setDayOffset((d) => Math.max(-1, d - 1))} aria-label="prev" className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[92px] px-1 text-center text-[13px] font-semibold">{lang === "tr" ? dayLabel.tr : dayLabel.en}</span>
            <button onClick={() => setDayOffset((d) => Math.min(1, d + 1))} aria-label="next" className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Randevu" : "New"}
          </button>
        </div>
      </div>

      {/* Filters: staff + service legend */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          {lang === "tr" ? "Personel:" : "Staff:"}
        </span>
        <button
          onClick={() => setStaffFilter(null)}
          className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors", !staffFilter ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
        >
          {lang === "tr" ? "Hepsi" : "All"}
        </button>
        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => setStaffFilter(s.id)}
            className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors", staffFilter === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
          >
            {s.name.split(" ")[0]}
          </button>
        ))}
        <span className="ml-auto hidden flex-wrap items-center gap-x-3 gap-y-1 sm:flex">
          {services.slice(0, 6).map((sv) => (
            <span key={sv.id} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-[3px]" style={{ background: SERVICE_VAR[sv.color] }} />
              {t(sv.name)}
            </span>
          ))}
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <div style={{ minWidth: Math.max(640, visibleStaff.length * 180 + 56) }}>
            {/* staff header */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${visibleStaff.length}, 1fr)` }}>
              <div />
              {visibleStaff.map((s) => (
                <div key={s.id} className="flex items-center gap-2 border-l border-border/60 px-3 py-3">
                  <span className="relative grid h-8 w-8 place-items-center rounded-full bg-muted text-[11px] font-bold text-foreground/70 ring-1 ring-border">
                    {s.initials}
                    <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", s.online ? "bg-success" : "bg-muted-foreground/40")} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight">{s.name}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">{t(s.role)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* body */}
            <div className="grid" style={{ gridTemplateColumns: `56px repeat(${visibleStaff.length}, 1fr)` }}>
              {/* time gutter */}
              <div className="relative" style={{ height: gridH }}>
                {Array.from({ length: totalSlots + 1 }).map((_, i) => {
                  const min = dayStartMin + i * slotMin;
                  return min % 60 === 0 ? (
                    <div key={i} className="absolute right-2 -translate-y-1/2 tnum text-[10px] text-muted-foreground" style={{ top: i * rowH }}>
                      {minutesToHHMM(min)}
                    </div>
                  ) : null;
                })}
              </div>

              {visibleStaff.map((s) => {
                const colAppts = dayAppts.filter((a) => a.staffId === s.id);
                return (
                  <div key={s.id} className="relative border-l border-border/60" style={{ height: gridH }}>
                    {Array.from({ length: totalSlots }).map((_, i) => {
                      const min = dayStartMin + i * slotMin;
                      const offHours = min < s.startMin || min >= s.endMin;
                      return (
                        <div
                          key={i}
                          className={cn("absolute inset-x-0 border-t", min % 60 === 0 ? "border-border/70" : "border-border/25", offHours && "bg-muted/40")}
                          style={{ top: i * rowH, height: rowH }}
                        />
                      );
                    })}
                    {colAppts.map((a) => {
                      const svc = serviceById(a.serviceId);
                      const top = ((a.startMin - dayStartMin) / slotMin) * rowH;
                      const height = (svc.durationMin / slotMin) * rowH;
                      const color = SERVICE_VAR[svc.color];
                      const faded = a.status === "no-show";
                      return (
                        <button
                          key={a.id}
                          onClick={() => setOpen(a)}
                          className={cn("absolute inset-x-1 overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5 text-left transition-all hover:z-10 hover:shadow-pop", faded && "opacity-55")}
                          style={{ top: top + 1, height: Math.max(height - 2, 28), background: `color-mix(in oklch, ${color} 13%, white)`, borderColor: color }}
                          title={`${a.client} · ${t(svc.name)}`}
                        >
                          <p className="truncate text-[11.5px] font-semibold leading-tight" style={{ color: `color-mix(in oklch, ${color} 70%, black)` }}>{a.client}</p>
                          <p className="truncate text-[10px] text-foreground/60">{t(svc.name)}</p>
                          {height > 50 && <p className="tnum mt-0.5 text-[9.5px] text-foreground/50">{minutesToHHMM(a.startMin)}</p>}
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

      {/* Detail modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="w-full max-w-sm animate-pop rounded-2xl border border-border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const svc = serviceById(open.serviceId);
              const stf = staffById(open.staffId);
              const st = STATUS_META[open.status];
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>{open.clientInitials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold leading-tight">{open.client}</p>
                      <p className="tnum text-[11px] text-muted-foreground">{open.clientPhone}</p>
                    </div>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", st.tone)}>{t(st.label)}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-muted-foreground">{lang === "tr" ? "Hizmet" : "Service"}</span><span className="inline-flex items-center gap-1.5 font-medium"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[svc.color] }} />{t(svc.name)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{lang === "tr" ? "Personel" : "Staff"}</span><span className="font-medium">{stf.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{lang === "tr" ? "Saat" : "Time"}</span><span className="tnum font-medium">{minutesToLabel(open.startMin)} · {formatDuration(svc.durationMin)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{lang === "tr" ? "Tutar" : "Price"}</span><span className="tnum font-semibold">{formatPrice(open.price)}</span></div>
                  </div>
                  <button onClick={() => setOpen(null)} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    {lang === "tr" ? "Kapat" : "Close"}
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
