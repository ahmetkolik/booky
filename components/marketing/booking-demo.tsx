"use client";

import { useState } from "react";
import { Check, Clock, CalendarPlus, Sparkles } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatPrice, formatDuration, minutesToHHMM } from "@/lib/utils";
import { serviceById, SERVICE_VAR, demoServices, demoSlots } from "@/lib/demo/data";

interface Booked {
  serviceId: string;
  slotMin: number;
  client: string;
}

const CLIENTS = ["Ayşe", "Mehmet", "Lena", "Tom", "Zoe", "Deniz"];

/**
 * Interactive landing demo: a client picks a service + a time slot, books, and
 * the booking lands on the day strip while today's revenue ticks up. Pure
 * useState — no deps. Resettable.
 */
export function BookingDemo() {
  const { t, lang } = useLang();
  const [serviceId, setServiceId] = useState(demoServices[0]);
  const [slot, setSlot] = useState<number | null>(null);
  const [booked, setBooked] = useState<Booked[]>([]);
  const [pulse, setPulse] = useState(false);

  const baseRevenue = 842;
  const revenue = baseRevenue + booked.reduce((s, b) => s + serviceById(b.serviceId).price, 0);
  const takenSlots = new Set(booked.map((b) => b.slotMin));

  function book() {
    if (slot === null || takenSlots.has(slot)) return;
    const client = CLIENTS[booked.length % CLIENTS.length];
    setBooked((b) => [...b, { serviceId, slotMin: slot, client }]);
    setSlot(null);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* ── Left: the public booking widget ───────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold leading-tight">{lang === "tr" ? "Müşteri görünümü" : "Client view"}</p>
            <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "rezervasyon sayfan" : "your booking page"}</p>
          </div>
        </div>

        {/* service picker */}
        <p className="mt-4 label-mono text-muted-foreground">{lang === "tr" ? "1 · Hizmet" : "1 · Service"}</p>
        <div className="mt-2 space-y-2">
          {demoServices.map((id) => {
            const s = serviceById(id);
            const sel = id === serviceId;
            return (
              <button
                key={id}
                onClick={() => setServiceId(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  sel ? "border-primary/50 bg-primary/[0.05]" : "border-border hover:bg-muted/50",
                )}
              >
                <span className="h-3 w-3 rounded-[4px]" style={{ background: SERVICE_VAR[s.color] }} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{t(s.name)}</span>
                <span className="tnum text-[11px] text-muted-foreground">{formatDuration(s.durationMin)}</span>
                <span className="tnum text-[13px] font-semibold">{formatPrice(s.price)}</span>
                {sel && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* slot picker */}
        <p className="mt-4 label-mono text-muted-foreground">{lang === "tr" ? "2 · Saat" : "2 · Time"}</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {demoSlots.map((s) => {
            const taken = takenSlots.has(s.min);
            const sel = slot === s.min;
            return (
              <button
                key={s.min}
                disabled={taken}
                onClick={() => setSlot(s.min)}
                className={cn(
                  "tnum rounded-md border py-1.5 text-center text-[12.5px] transition-colors",
                  taken
                    ? "cursor-not-allowed border-border/60 bg-muted text-muted-foreground/40 line-through"
                    : sel
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-primary/50",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={book}
          disabled={slot === null}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <CalendarPlus className="h-4 w-4" />
          {lang === "tr" ? "Rezerve et" : "Confirm booking"}
        </button>
        {booked.length > 0 && (
          <button onClick={() => setBooked([])} className="mt-2 w-full text-center text-[11px] text-muted-foreground hover:text-foreground">
            {lang === "tr" ? "Demoyu sıfırla" : "Reset demo"}
          </button>
        )}
      </div>

      {/* ── Right: the owner's day strip + revenue ─────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold leading-tight">{lang === "tr" ? "Senin panelin" : "Your dashboard"}</p>
            <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "anında güncellenir" : "updates instantly"}</p>
          </div>
          <div className={cn("rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-right transition-transform", pulse && "animate-pop")}>
            <p className="label-mono text-muted-foreground">{lang === "tr" ? "Bugünkü gelir" : "Revenue today"}</p>
            <p className="tnum text-lg font-bold leading-none text-foreground">{formatPrice(revenue)}</p>
          </div>
        </div>

        {/* day strip */}
        <div className="mt-4 space-y-1.5">
          {demoSlots.map((s) => {
            const b = booked.find((x) => x.slotMin === s.min);
            const svcB = b ? serviceById(b.serviceId) : null;
            return (
              <div key={s.min} className="flex items-center gap-3">
                <span className="tnum w-12 shrink-0 text-[11px] text-muted-foreground">{minutesToHHMM(s.min)}</span>
                {b && svcB ? (
                  <div
                    className="animate-pop flex flex-1 items-center gap-2 overflow-hidden rounded-md border-l-[3px] px-2.5 py-1.5"
                    style={{ background: `color-mix(in oklch, ${SERVICE_VAR[svcB.color]} 13%, white)`, borderColor: SERVICE_VAR[svcB.color] }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: `color-mix(in oklch, ${SERVICE_VAR[svcB.color]} 70%, black)` }}>
                      {b.client}
                    </span>
                    <span className="truncate text-[11px] text-foreground/60">{t(svcB.name)}</span>
                    <span className="tnum ml-auto text-[11px] font-semibold text-foreground/70">{formatPrice(svcB.price)}</span>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center rounded-md border border-dashed border-border px-2.5 py-1.5 text-[11px] text-muted-foreground/60">
                    {lang === "tr" ? "boş" : "open"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {booked.length === 0
            ? lang === "tr"
              ? "Bir hizmet ve saat seç, sonra rezerve et →"
              : "Pick a service and time, then book →"
            : lang === "tr"
              ? `${booked.length} randevu eklendi · ${booked.length} SMS hatırlatma kuyruğa alındı`
              : `${booked.length} booking added · ${booked.length} SMS reminders queued`}
        </div>
      </div>
    </div>
  );
}
