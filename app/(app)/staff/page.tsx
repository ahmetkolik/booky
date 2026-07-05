"use client";

import { useState } from "react";
import { Plus, X, Clock, BarChart2, CheckCircle2, Circle } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatDuration, minutesToHHMM } from "@/lib/utils";
import { staff, services, appointments, SERVICE_VAR, type Staff } from "@/lib/demo/data";

const SERVICE_COLORS: Record<string, string> = {};
for (const s of services) SERVICE_COLORS[s.id] = SERVICE_VAR[s.color];

/** Services each staff member handles — derived from appointment history in demo. */
function staffServices(staffId: string) {
  const seen = new Set<string>();
  for (const a of appointments) {
    if (a.staffId === staffId) seen.add(a.serviceId);
  }
  return services.filter((s) => seen.has(s.id));
}

function UtilBar({ value }: { value: number }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function HourLabel({ min }: { min: number }) {
  return <span className="tnum text-[11px]">{minutesToHHMM(min)}</span>;
}

export default function StaffPage() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Staff | null>(staff[0]);

  const onlineCount = staff.filter((s) => s.online).length;
  const avgUtil = Math.round(staff.reduce((sum, s) => sum + s.utilization, 0) / staff.length);

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <div className={cn("grid gap-6", selected ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* ── Main ──────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "Personel" : "Staff"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {staff.length} {lang === "tr" ? "personel" : "members"} · {onlineCount} {lang === "tr" ? "çevrimiçi" : "online"} · {lang === "tr" ? "ort. doluluk" : "avg utilization"} {avgUtil}%
              </p>
            </div>
            <button className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              {lang === "tr" ? "Personel ekle" : "Add member"}
            </button>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {staff.map((s) => {
              const svcList = staffServices(s.id);
              const isSel = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={cn(
                    "group rounded-2xl border bg-card p-5 text-left shadow-soft transition-all hover:shadow-pop",
                    isSel ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
                  )}
                >
                  {/* Avatar row */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <span className="grid h-12 w-12 place-items-center rounded-full text-base font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
                        {s.initials}
                      </span>
                      <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card", s.online ? "bg-success" : "bg-muted-foreground/40")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{s.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{t(s.role)}</p>
                    </div>
                    <span className={cn("mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", s.online ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                      {s.online ? (lang === "tr" ? "çevrimiçi" : "online") : (lang === "tr" ? "çevrimdışı" : "offline")}
                    </span>
                  </div>

                  {/* Working hours */}
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <HourLabel min={s.startMin} />
                    <span>–</span>
                    <HourLabel min={s.endMin} />
                    <span className="ml-auto text-[11px]">
                      {formatDuration(s.endMin - s.startMin)}
                    </span>
                  </div>

                  {/* Utilization */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{lang === "tr" ? "Doluluk" : "Utilization"}</span>
                      <span className="tnum font-semibold text-foreground">{s.utilization}%</span>
                    </div>
                    <UtilBar value={s.utilization} />
                  </div>

                  {/* Services */}
                  <div className="mt-4">
                    <p className="label-mono text-muted-foreground">{lang === "tr" ? "Hizmetler" : "Services"}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {svcList.map((sv) => (
                        <span key={sv.id} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px]">
                          <span className="h-2 w-2 rounded-[3px]" style={{ background: SERVICE_VAR[sv.color] }} />
                          {t(sv.name)}
                        </span>
                      ))}
                      {svcList.length === 0 && (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Drawer ────────────────────────────────────────────── */}
        {selected && (
          <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  {lang === "tr" ? "Personel kartı" : "Member card"}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="close"
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="grid h-14 w-14 place-items-center rounded-full text-lg font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
                    {selected.initials}
                  </span>
                  <span className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card", selected.online ? "bg-success" : "bg-muted-foreground/40")} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{selected.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{t(selected.role)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <p className="tnum text-[18px] font-bold leading-none">{selected.utilization}%</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{lang === "tr" ? "Doluluk" : "Utilization"}</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="tnum text-[18px] font-bold leading-none">
                    {appointments.filter((a) => a.staffId === selected.id && a.dayOffset === 0).length}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{lang === "tr" ? "Bugünkü randevu" : "Today's bookings"}</p>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Çalışma saatleri" : "Working hours"}</p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border p-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="tnum text-[13px]">
                    {minutesToHHMM(selected.startMin)} – {minutesToHHMM(selected.endMin)}
                  </span>
                  <span className="ml-auto text-[12px] text-muted-foreground">
                    {formatDuration(selected.endMin - selected.startMin)}
                  </span>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Hizmetler" : "Services"}</p>
                <div className="mt-2 space-y-1.5">
                  {staffServices(selected.id).map((sv) => (
                    <div key={sv.id} className="flex items-center gap-2.5 rounded-xl border border-border p-2.5">
                      <span className="h-7 w-1.5 rounded-full" style={{ background: SERVICE_VAR[sv.color] }} />
                      <span className="flex-1 text-[13px] font-medium">{t(sv.name)}</span>
                      <span className="tnum text-[11px] text-muted-foreground">{formatDuration(sv.durationMin)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilization bar detail */}
              <div>
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Doluluk oranı" : "Utilization rate"}</p>
                <div className="mt-2 space-y-1.5">
                  <UtilBar value={selected.utilization} />
                  <p className="text-[11px] text-muted-foreground">
                    {selected.utilization >= 80
                      ? lang === "tr" ? "Yüksek yoğunluk — takvim dolu." : "High load — calendar is packed."
                      : selected.utilization >= 60
                        ? lang === "tr" ? "Orta yoğunluk — slot mevcut." : "Moderate load — slots available."
                        : lang === "tr" ? "Düşük yoğunluk — daha fazla rezervasyon alabilir." : "Light load — can take more bookings."}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-[13px]">
                {selected.online ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  {selected.online
                    ? lang === "tr" ? "Bugün çalışıyor, rezervasyon kabul ediyor." : "Working today, accepting bookings."
                    : lang === "tr" ? "Bugün çalışmıyor." : "Not working today."}
                </span>
              </div>

              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <BarChart2 className="h-4 w-4" />
                {lang === "tr" ? "Takvimi görüntüle" : "View schedule"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
