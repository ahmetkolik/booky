"use client";

/**
 * The Signal Scene — Booky's opening act. An empty day schedule fills into a
 * fully booked one as you scroll: appointment blocks pop in chronologically
 * (colored by service), a "now" line glides down the day, and the revenue
 * counter springs upward with every booking. This is the product's core value
 * ("an empty hour becomes a booked one") staged as the hero.
 *
 * Mechanics — real DOM state, not video frames:
 * - Desktop (lg+, motion OK): the section is 280vh tall; the content is sticky
 *   and a scroll-scrub maps progress → --sp (CSS var, no re-renders) + a
 *   quantized `stage` (how many blocks are visible).
 * - Small screens: normal flow; the scene auto-plays once when it enters view.
 * - prefers-reduced-motion: renders the finished (fully booked) day, static.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, ChevronDown } from "lucide-react";
import appConfig from "@/app.config";
import { useLang } from "@/components/i18n/language-provider";
import { Kinetic, Magnetic, prefersReducedMotion } from "@/components/marketing/motion";
import { cn, formatPrice, minutesToHHMM } from "@/lib/utils";
import {
  appointments,
  serviceById,
  staff,
  dayStartMin,
  dayEndMin,
  SERVICE_VAR,
} from "@/lib/demo/data";
import type { L } from "@/lib/i18n/config";

const SCENE_TEXT = {
  today: { tr: "Bugün", en: "Today" },
  staffCount: { tr: "4 personel", en: "4 staff" },
  live: { tr: "canlı", en: "live" },
  revenue: { tr: "Bugünkü gelir", en: "Revenue today" },
  bookings: { tr: "randevu", en: "bookings" },
  now: { tr: "şimdi", en: "now" },
  scrollHint: { tr: "Kaydır — günün dolsun", en: "Scroll — watch the day fill" },
  emptyDay: { tr: "Gün boş başlıyor…", en: "The day starts empty…" },
  fullDay: { tr: "Gün doldu — sen hiç telefon açmadan.", en: "Fully booked — without a single phone call." },
} satisfies Record<string, L>;

/* The day's bookings, staged chronologically from the shared demo data. */
function useSceneBlocks() {
  return useMemo(() => {
    const span = dayEndMin - dayStartMin;
    return appointments
      .filter((a) => a.dayOffset === 0)
      .sort((a, b) => a.startMin - b.startMin)
      .map((a) => {
        const svc = serviceById(a.serviceId);
        const col = staff.findIndex((s) => s.id === a.staffId);
        return {
          id: a.id,
          col,
          topPct: ((a.startMin - dayStartMin) / span) * 100,
          hPct: (svc.durationMin / span) * 100,
          color: SERVICE_VAR[svc.color],
          client: a.client.split(" ")[0],
          label: svc.name,
          price: a.price,
          time: minutesToHHMM(a.startMin),
        };
      });
  }, []);
}

export function SignalScene({ benefits }: { benefits: L[] }) {
  const { t, lang } = useLang();
  const m = appConfig.marketing;
  const blocks = useSceneBlocks();
  const N = blocks.length;

  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return;

    if (prefersReducedMotion()) {
      host.style.setProperty("--sp", "1");
      setStage(N);
      return;
    }

    const desktop = window.matchMedia("(min-width: 1024px)").matches;

    if (!desktop) {
      // Small screens: play the day filling up once, when the scene appears.
      let timer: ReturnType<typeof setInterval> | null = null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          let i = 0;
          timer = setInterval(() => {
            i += 1;
            setStage(i);
            host.style.setProperty("--sp", (i / N).toFixed(3));
            if (i >= N && timer) clearInterval(timer);
          }, 170);
        },
        { threshold: 0.3 },
      );
      io.observe(host);
      return () => {
        io.disconnect();
        if (timer) clearInterval(timer);
      };
    }

    // Desktop: scroll-scrub through the tall wrapper.
    let raf = 0;
    const update = () => {
      const r = wrap.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      host.style.setProperty("--sp", p.toFixed(4));
      const fill = Math.min(1, Math.max(0, (p - 0.04) / 0.9));
      setStage(Math.min(N, Math.floor(fill * (N + 0.999))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [N]);

  const revenue = blocks.slice(0, stage).reduce((s, b) => s + b.price, 0);
  const done = stage >= N;

  return (
    <section ref={wrapRef} className="scene-wrap relative lg:h-[280vh]">
      <div
        ref={hostRef}
        className="scene-host relative overflow-hidden lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:flex-col lg:justify-center"
      >
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} />

        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:py-8">
          {/* ── Copy — kinetic headline, recedes gently as the day fills ── */}
          <div
            className="stagger"
            style={{ transform: "translateY(calc(var(--sp, 0) * -22px))", transition: "transform 0.1s linear" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
              {t(m.badge)}
            </span>
            <h1 className="mt-5 max-w-xl font-display text-[40px] font-bold leading-[1.03] tracking-tight sm:text-[56px]">
              <Kinetic text={t(m.heroTitle)} delay={80} />{" "}
              <Kinetic
                text={t(m.heroAccent)}
                delay={80 + t(m.heroTitle).split(" ").length * 70}
                className="accent-pulse"
                wordClassName="bg-gradient-to-r from-[oklch(70%_0.16_14)] to-[oklch(62%_0.17_350)] bg-clip-text text-transparent"
              />
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{t(m.heroSubtitle)}</p>

            <ul className="mt-7 space-y-2.5">
              {benefits.map((b) => (
                <li key={t(b)} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/85">{t(b)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href="#demo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
                >
                  {t(m.heroCtaSecondary)}
                </a>
              </Magnetic>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {lang === "tr" ? "Kart gerekmez · demo modda anında çalışır" : "No card required · runs instantly in demo mode"}
            </p>
          </div>

          {/* ── The scene — an empty day booking itself full ─────────────── */}
          <div className="relative">
            <span className="blob absolute -right-8 -top-10 -z-10 h-56 w-56 bg-primary/25 drift" aria-hidden />
            <span
              className="blob absolute -bottom-10 -left-8 -z-10 h-48 w-48 drift"
              aria-hidden
              style={{ background: "color-mix(in oklch, var(--seg-2) 30%, transparent)" }}
            />

            <div className="rounded-2xl border border-border bg-card p-4 shadow-pop sm:p-5">
              {/* card header: day label + live chip + springing revenue */}
              <div className="flex items-center justify-between gap-3 pb-3">
                <div>
                  <p className="font-display text-sm font-semibold leading-tight">
                    {t(SCENE_TEXT.today)} · {t(SCENE_TEXT.staffCount)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground" aria-live="off">
                    <span className="tnum font-semibold text-foreground/75">{stage}</span>/{N} {t(SCENE_TEXT.bookings)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> {t(SCENE_TEXT.live)}
                  </span>
                  <div className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-right">
                    <p className="label-mono text-muted-foreground">{t(SCENE_TEXT.revenue)}</p>
                    <p key={stage} className="tnum animate-spring-pop text-lg font-bold leading-none text-foreground">
                      {formatPrice(revenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* staff header */}
              <div className="grid" style={{ gridTemplateColumns: "44px repeat(4, 1fr)" }}>
                <div />
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center justify-center gap-1.5 px-1 pb-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-muted text-[8.5px] font-bold text-foreground/70 ring-1 ring-border">
                      {s.initials}
                    </span>
                    <span className="hidden truncate text-[11px] font-semibold text-muted-foreground sm:block">
                      {s.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* the day grid */}
              <div className="relative grid" style={{ gridTemplateColumns: "44px repeat(4, 1fr)" }}>
                {/* time gutter */}
                <div className="relative h-[340px] sm:h-[400px]">
                  {Array.from({ length: (dayEndMin - dayStartMin) / 60 + 1 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute right-2 -translate-y-1/2 tnum text-[9px] text-muted-foreground"
                      style={{ top: `${(i / ((dayEndMin - dayStartMin) / 60)) * 100}%` }}
                    >
                      {minutesToHHMM(dayStartMin + i * 60)}
                    </span>
                  ))}
                </div>

                {/* staff columns */}
                {staff.map((s, ci) => (
                  <div key={s.id} className="relative h-[340px] border-l border-border/50 sm:h-[400px]">
                    {Array.from({ length: (dayEndMin - dayStartMin) / 60 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-x-0 border-t border-border/30"
                        style={{ top: `${(i / ((dayEndMin - dayStartMin) / 60)) * 100}%` }}
                      />
                    ))}
                    {blocks
                      .filter((b) => b.col === ci)
                      .map((b) => {
                        const idx = blocks.indexOf(b);
                        const on = idx < stage;
                        return (
                          <div
                            key={b.id}
                            className={cn("scene-block absolute inset-x-0.5 overflow-hidden rounded-md border-l-[3px] px-1.5 py-0.5", on && "is-on")}
                            style={{
                              top: `calc(${b.topPct}% + 1px)`,
                              height: `calc(${b.hPct}% - 2px)`,
                              background: `color-mix(in oklch, ${b.color} 14%, white)`,
                              borderColor: b.color,
                              ["--glow-c" as string]: b.color,
                            }}
                          >
                            <p className="truncate text-[10px] font-semibold leading-tight" style={{ color: `color-mix(in oklch, ${b.color} 70%, black)` }}>
                              {b.client}
                            </p>
                            <p className="hidden truncate text-[9px] text-foreground/55 sm:block">{t(b.label)}</p>
                          </div>
                        );
                      })}
                  </div>
                ))}

                {/* the "now" line — glides down the day with scroll */}
                <div
                  className="pointer-events-none absolute inset-x-0 z-10"
                  style={{ top: "calc(var(--sp, 0) * 94% + 2%)" }}
                  aria-hidden
                >
                  <div className="relative ml-[44px] border-t-[1.5px] border-primary/80">
                    <span className="absolute -left-1 -top-[4.5px] h-2 w-2 rounded-full bg-primary" />
                    <span className="absolute -top-2.5 right-0 rounded-full bg-primary px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wide text-primary-foreground">
                      {t(SCENE_TEXT.now)}
                    </span>
                  </div>
                </div>
              </div>

              {/* footer caption flips when the day is full */}
              <p className={cn("mt-3 text-center text-[12px] transition-colors duration-500", done ? "font-semibold text-success" : "text-muted-foreground")}>
                {done ? `✓ ${t(SCENE_TEXT.fullDay)}` : t(SCENE_TEXT.emptyDay)}
              </p>
            </div>
          </div>
        </div>

        {/* scroll hint — desktop scrub only; fades as soon as scrolling starts */}
        <div
          className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground lg:flex"
          style={{ opacity: "calc(1 - var(--sp, 0) * 8)" }}
          aria-hidden
        >
          <span className="label-mono">{t(SCENE_TEXT.scrollHint)}</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

/* ── SceneMotif — the closing echo: the same day, already full. Used inside
   the final CTA so the page loops visually from empty → booked. ───────────── */
export function SceneMotif({ className }: { className?: string }) {
  const blocks = useSceneBlocks();
  return (
    <svg viewBox="0 0 240 130" className={className} aria-hidden fill="none">
      {[0, 1, 2, 3].map((c) => (
        <line key={c} x1={30 + c * 52.5} y1={6} x2={30 + c * 52.5} y2={124} stroke="white" strokeOpacity="0.18" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4].map((r) => (
        <line key={r} x1={30} y1={6 + r * 29.5} x2={240} y2={6 + r * 29.5} stroke="white" strokeOpacity="0.12" strokeWidth="1" />
      ))}
      {blocks.map((b) => (
        <rect
          key={b.id}
          x={33 + b.col * 52.5}
          y={6 + (b.topPct / 100) * 118}
          width={46}
          height={Math.max((b.hPct / 100) * 118 - 2, 6)}
          rx={3}
          fill="white"
          fillOpacity={0.28 + (b.col % 3) * 0.1}
        />
      ))}
      <line x1={30} y1={98} x2={240} y2={98} stroke="white" strokeWidth="1.5" />
      <circle cx={30} cy={98} r={3} fill="white" />
    </svg>
  );
}
