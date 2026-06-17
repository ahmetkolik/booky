"use client";

import { useState } from "react";
import { Search, Plus, X, Phone, Mail, Star, CalendarCheck } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatPrice, minutesToHHMM, formatDate } from "@/lib/utils";
import {
  clients,
  CLIENT_TAG,
  appointments,
  serviceById,
  SERVICE_VAR,
  STATUS_META,
  type Client,
} from "@/lib/demo/data";

export default function ClientsPage() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<Client["tag"] | null>(null);
  const [selected, setSelected] = useState<Client | null>(clients[0]);

  const rows = clients.filter((c) => {
    if (tagFilter && c.tag !== tagFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  // Appointment history for the selected client (match by name in demo data).
  const history = selected
    ? appointments.filter((a) => a.client === selected.name).sort((a, b) => b.dayOffset - a.dayOffset || b.startMin - a.startMin)
    : [];

  const totalClients = clients.length;
  const vipCount = clients.filter((c) => c.tag === "vip").length;

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <div className={cn("grid gap-6", selected ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* Main */}
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Müşteriler" : "Clients"}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {totalClients} {lang === "tr" ? "müşteri" : "clients"} · {vipCount} VIP
              </p>
            </div>
            <button className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              {lang === "tr" ? "Müşteri ekle" : "Add client"}
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "tr" ? "İsim veya e-posta…" : "Name or email…"}
                className="w-40 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:w-56"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTagFilter(null)}
                className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors", !tagFilter ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
              >
                {lang === "tr" ? "Hepsi" : "All"}
              </button>
              {(["vip", "regular", "new", "lapsed"] as Client["tag"][]).map((tg) => (
                <button
                  key={tg}
                  onClick={() => setTagFilter(tg)}
                  className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium capitalize transition-colors", tagFilter === tg ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
                >
                  {t(CLIENT_TAG[tg].label)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Müşteri" : "Client"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Etiket" : "Tag"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground md:table-cell">{lang === "tr" ? "Son ziyaret" : "Last visit"}</th>
                    <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Ziyaret" : "Visits"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Harcama" : "Spend"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">{lang === "tr" ? "Eşleşen müşteri yok." : "No matching clients."}</td></tr>
                  )}
                  {rows.map((c) => {
                    const tag = CLIENT_TAG[c.tag];
                    const isSel = selected?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={cn("cursor-pointer border-b border-border/60 transition-colors last:border-0", isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50")}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold text-foreground/70 ring-1 ring-border">{c.initials}</span>
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight">{c.name}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", tag.tone)}>{t(tag.label)}</span>
                        </td>
                        <td className="tnum hidden py-3 text-muted-foreground md:table-cell">{formatDate(c.lastVisit)}</td>
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

        {/* Drawer */}
        {selected && (
          <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Müşteri kartı" : "Client card"}</h2>
                <button onClick={() => setSelected(null)} aria-label="close" className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:hidden">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full text-base font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>{selected.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{selected.name}</p>
                  <span className={cn("mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", CLIENT_TAG[selected.tag].tone)}>{t(CLIENT_TAG[selected.tag].label)}</span>
                </div>
              </div>

              <div className="space-y-2 text-[13px]">
                <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground">
                  <Phone className="h-4 w-4" /> <span className="tnum">{selected.phone}</span>
                </a>
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground">
                  <Mail className="h-4 w-4" /> {selected.email}
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Stat label={lang === "tr" ? "Ziyaret" : "Visits"} value={String(selected.visits)} />
                <Stat label={lang === "tr" ? "Harcama" : "Spend"} value={formatPrice(selected.spend)} />
                <Stat label={lang === "tr" ? "Son" : "Last"} value={formatDate(selected.lastVisit, { day: "2-digit", month: "short" })} />
              </div>

              {/* History */}
              <div>
                <p className="label-mono text-muted-foreground">{lang === "tr" ? "Randevu geçmişi" : "Booking history"}</p>
                <div className="mt-2.5 space-y-2">
                  {history.length === 0 && (
                    <p className="text-[13px] text-muted-foreground">{lang === "tr" ? "Bu görünümde kayıtlı randevu yok." : "No appointments in this view."}</p>
                  )}
                  {history.map((a) => {
                    const svc = serviceById(a.serviceId);
                    const st = STATUS_META[a.status];
                    return (
                      <div key={a.id} className="flex items-center gap-2.5 rounded-xl border border-border p-2.5">
                        <span className="h-7 w-1.5 rounded-full" style={{ background: SERVICE_VAR[svc.color] }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">{t(svc.name)}</p>
                          <p className="tnum text-[11px] text-muted-foreground">{minutesToHHMM(a.startMin)} · {formatPrice(a.price)}</p>
                        </div>
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold", st.tone)}>{t(st.label)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <CalendarCheck className="h-4 w-4" />
                {lang === "tr" ? "Randevu oluştur" : "Book appointment"}
              </button>
            </div>

            {/* Loyalty note */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-warning/15 text-warning-foreground">
                <Star className="h-4 w-4" />
              </span>
              <p className="text-[12.5px] text-muted-foreground">
                {selected.tag === "vip"
                  ? lang === "tr" ? "VIP — bir sonraki ziyarette %10 teşekkür indirimi öner." : "VIP — offer a 10% thank-you on the next visit."
                  : selected.tag === "lapsed"
                    ? lang === "tr" ? "Uzaklaşmış — geri kazanım için bir hatırlatma gönder." : "Lapsed — send a win-back reminder."
                    : lang === "tr" ? "Sadakat puanı artıyor. Devam etsin!" : "Loyalty is building. Keep it going!"}
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="tnum text-[15px] font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
