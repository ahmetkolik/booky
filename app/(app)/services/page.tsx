"use client";

import { useState } from "react";
import { Plus, X, Clock, CreditCard, TrendingUp, Tag } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatPrice, formatDuration } from "@/lib/utils";
import { services, SERVICE_VAR, type Service } from "@/lib/demo/data";

export default function ServicesPage() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Service | null>(services[0]);

  const totalRevPotential = services.reduce((s, sv) => s + sv.price * sv.bookings30d, 0);
  const avgPrice = Math.round(services.reduce((s, sv) => s + sv.price, 0) / services.length);
  const mostBooked = [...services].sort((a, b) => b.bookings30d - a.bookings30d)[0];

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <div className={cn("grid gap-6", selected ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* ── Main ──────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "Hizmetler" : "Services"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {services.length} {lang === "tr" ? "hizmet" : "services"} · {lang === "tr" ? "ort." : "avg."} {formatPrice(avgPrice)}
              </p>
            </div>
            <button className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              {lang === "tr" ? "Hizmet ekle" : "Add service"}
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "Toplam hizmet" : "Total services"}</p>
              <p className="tnum mt-1 text-2xl font-bold leading-none">{services.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "Ortalama fiyat" : "Avg. price"}</p>
              <p className="tnum mt-1 text-2xl font-bold leading-none">{formatPrice(avgPrice)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "Bu ay rezervasyon" : "Bookings this month"}</p>
              <p className="tnum mt-1 text-2xl font-bold leading-none">
                {services.reduce((s, sv) => s + sv.bookings30d, 0)}
              </p>
            </div>
          </div>

          {/* Services table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Hizmet" : "Service"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Süre" : "Duration"}</th>
                    <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Depozito" : "Deposit"}</th>
                    <th className="label-mono hidden py-2.5 text-right font-medium text-muted-foreground md:table-cell">{lang === "tr" ? "30g rezerv." : "30d bookings"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Fiyat" : "Price"}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((sv) => {
                    const isSel = selected?.id === sv.id;
                    const color = SERVICE_VAR[sv.color];
                    return (
                      <tr
                        key={sv.id}
                        onClick={() => setSelected(sv)}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <span className="h-8 w-1.5 rounded-full" style={{ background: color }} />
                            <div>
                              <p className="font-semibold leading-tight">{t(sv.name)}</p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">{sv.color}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(sv.durationMin)}
                          </span>
                        </td>
                        <td className="tnum py-3 text-right">
                          {sv.deposit > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {formatPrice(sv.deposit)}
                            </span>
                          ) : (
                            <span className="text-[12px] text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="tnum hidden py-3 text-right text-muted-foreground md:table-cell">
                          {sv.bookings30d}
                        </td>
                        <td className="tnum py-3 pr-4 text-right font-semibold">{formatPrice(sv.price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Drawer ────────────────────────────────────────────── */}
        {selected && (
          <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  {lang === "tr" ? "Hizmet detayı" : "Service detail"}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="close"
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Color + name */}
              <div className="flex items-center gap-3">
                <span
                  className="h-14 w-3 rounded-full"
                  style={{ background: SERVICE_VAR[selected.color] }}
                />
                <div>
                  <p className="font-semibold leading-tight">{t(selected.name)}</p>
                  <p className="mt-0.5 text-[12px] capitalize text-muted-foreground">{selected.color}</p>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3 text-center">
                  <p className="tnum text-[18px] font-bold leading-none">{formatPrice(selected.price)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{lang === "tr" ? "Fiyat" : "Price"}</p>
                </div>
                <div className="rounded-xl border border-border p-3 text-center">
                  <p className="tnum text-[18px] font-bold leading-none">{formatDuration(selected.durationMin)}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{lang === "tr" ? "Süre" : "Duration"}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{lang === "tr" ? "Depozito" : "Deposit"}</span>
                  <span className="tnum font-semibold">
                    {selected.deposit > 0 ? formatPrice(selected.deposit) : lang === "tr" ? "Yok" : "None"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{lang === "tr" ? "Son 30 gün" : "Last 30 days"}</span>
                  <span className="tnum font-semibold">{selected.bookings30d} {lang === "tr" ? "rezervasyon" : "bookings"}</span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-border p-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{lang === "tr" ? "30g. gelir" : "30d revenue"}</span>
                  <span className="tnum font-semibold">{formatPrice(selected.price * selected.bookings30d)}</span>
                </div>
              </div>

              {/* Most booked badge */}
              {selected.id === mostBooked.id && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-[12.5px] text-primary">
                  {lang === "tr"
                    ? "En çok rezervasyon alan hizmet."
                    : "Most booked service this month."}
                </div>
              )}

              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                {lang === "tr" ? "Hizmeti düzenle" : "Edit service"}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
