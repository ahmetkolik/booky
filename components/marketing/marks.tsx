"use client";

import { Star, Check } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { formatPrice, formatDuration, minutesToHHMM } from "@/lib/utils";
import { services, serviceById, SERVICE_VAR, bookingPage } from "@/lib/demo/data";

/* ── Inline-SVG fake-business wordmarks for the trusted-by row ───────────────── */
export function CompanyMark({ name }: { name: string }) {
  const glyphs: Record<string, React.ReactNode> = {
    "Fade & Bıyık": <path d="M4 5 h16 v4 h-6 v9 h-4 v-9 h-6 z" />,
    "Glow Studio": <circle cx="12" cy="11" r="7" />,
    "Serenity Spa": <path d="M12 4 c5 4 5 10 0 14 c-5 -4 -5 -10 0 -14 z" />,
    "PeakFit": <path d="M3 17 L9 4 L12 11 L15 4 L21 17" />,
    "Nail Bar": <path d="M9 4 h6 v9 a3 3 0 0 1 -6 0 z" />,
    "Dermis Klinik": <path d="M12 4 v16 M4 12 h16" />,
    "Kuaför Selin": <path d="M6 4 v14 h10" />,
    "Pilates House": <path d="M4 12 a8 8 0 0 1 16 0" />,
  };
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground/70">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {glyphs[name]}
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">{name}</span>
    </span>
  );
}

/* ── Hero floating product preview: a public booking widget ────────────────── */
export function ProductPreview() {
  const { t, lang } = useLang();
  const opts = bookingPage.options.map(serviceById);

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-pop sm:p-5">
      {/* business header */}
      <div className="rounded-xl p-4 text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
        <p className="font-display text-lg font-bold leading-tight">{bookingPage.business}</p>
        <p className="text-[12px] text-white/80">{t(bookingPage.tagline)}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-white/90">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
          {bookingPage.rating} · {bookingPage.reviews} {lang === "tr" ? "yorum" : "reviews"}
        </p>
      </div>

      {/* service options */}
      <p className="mt-4 label-mono text-muted-foreground">{lang === "tr" ? "Hizmet seç" : "Pick a service"}</p>
      <div className="mt-2 space-y-2">
        {opts.slice(0, 3).map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${i === 0 ? "border-primary/40 bg-primary/[0.05]" : "border-border"}`}
          >
            <span className="h-3 w-3 rounded-[4px]" style={{ background: SERVICE_VAR[s.color] }} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{t(s.name)}</span>
            <span className="tnum text-[12px] text-muted-foreground">{formatDuration(s.durationMin)}</span>
            <span className="tnum text-[13px] font-semibold">{formatPrice(s.price)}</span>
            {i === 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* slots */}
      <p className="mt-4 label-mono text-muted-foreground">{lang === "tr" ? "Uygun saatler" : "Open times"}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {bookingPage.slots.map((m, i) => (
          <span
            key={m}
            className={`tnum rounded-md border py-1.5 text-center text-[12.5px] ${i === 1 ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
          >
            {minutesToHHMM(m)}
          </span>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
        {lang === "tr" ? "Rezerve et — depozito ₺100" : "Book now — ₺100 deposit"}
      </button>
      <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
        {lang === "tr" ? "Onay anında SMS ile gelir" : "Instant SMS confirmation"}
      </p>
    </div>
  );
}

/* ── Small star rating row used by testimonials ─────────────────────────────── */
export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
      ))}
    </span>
  );
}

export { services };
