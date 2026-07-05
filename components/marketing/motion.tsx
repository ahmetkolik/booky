"use client";

/**
 * Booky motion primitives — zero-dependency, SSR-safe. Everything here runs
 * client-side (IntersectionObserver + requestAnimationFrame + CSS custom
 * properties); nothing touches the DOM during render, so hydration stays
 * clean. Every effect early-returns under prefers-reduced-motion and the
 * matching CSS kill-switch in globals.css restores the final (visible) state.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const RM_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(pointer: fine)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(RM_QUERY).matches;
}

/* ── useInView — one-shot (or toggling) viewport observer ─────────────────── */
export function useInView<T extends HTMLElement>(opts?: {
  threshold?: number;
  margin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { threshold = 0.18, margin = "0px 0px -8% 0px", once = true } = opts ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, margin, once]);

  return { ref, inView };
}

/* ── Reveal — scroll-triggered entrance with configurable offset/rotation ──── */
export function Reveal({
  className,
  children,
  delay = 0,
  duration = 700,
  y = 26,
  x = 0,
  rot = 0,
  scale = 1,
  once = true,
}: {
  className?: string;
  children: React.ReactNode;
  /** ms before the transition starts once in view. */
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  /** initial rotation in degrees — the "pulled off a shelf" feel. */
  rot?: number;
  scale?: number;
  once?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });
  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "is-in", className)}
      style={
        {
          "--rv-delay": `${delay}ms`,
          "--rv-dur": `${duration}ms`,
          "--rv-y": `${y}px`,
          "--rv-x": `${x}px`,
          "--rv-rot": `${rot}deg`,
          "--rv-scale": scale,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/* ── Kinetic — word-by-word headline entrance (replays on language switch) ───
   `wordClassName` lands on each word span — put gradient/bg-clip-text classes
   there (clip-to-text doesn't survive the overflow-hidden word wrappers). */
export function Kinetic({
  text,
  className,
  wordClassName,
  delay = 0,
  step = 70,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={`${i}-${w}`}>
            {i > 0 && " "}
            <span className="kinetic-word">
              <span className={wordClassName} style={{ animationDelay: `${delay + i * step}ms` }}>
                {w}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

/* ── CountUp — odometer-style number that counts when scrolled into view ───── */
/* Renders the final string on the server (SEO-safe); animates the first
   numeric run inside it (handles "-38%", "92%", "₺12.850", "24/7", "5 dk"). */
export function CountUp({
  value,
  duration = 1400,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = value;
    if (prefersReducedMotion()) return;
    const match = value.match(/-?\d[\d.,]*/);
    if (!match || match.index === undefined) return;

    const raw = match[0];
    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + raw.length);
    // Parse "12.850" (tr thousands) and "38" alike: strip separators.
    const target = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(target)) return;
    const grouped = /\d\.\d{3}/.test(raw);

    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          const cur = Math.round(target * eased);
          const body = grouped ? new Intl.NumberFormat("tr-TR").format(cur) : String(cur);
          el.textContent = p < 1 ? prefix + body + suffix : value;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

/* ── TiltCard — pointer-tracking 3D tilt; the element itself is the card ───── */
export function TiltCard({
  className,
  children,
  max = 6,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  /** max tilt in degrees. */
  max?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("tilt-card", className)} style={style}>
      {children}
    </div>
  );
}

/* ── Magnetic — pulls its child toward a nearby cursor (buttons, CTAs) ─────── */
export function Magnetic({
  className,
  children,
  strength = 0.22,
  radius = 80,
}: {
  className?: string;
  children: React.ReactNode;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !window.matchMedia(FINE_QUERY).matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const reach = radius + Math.max(r.width, r.height) / 2;
        if (dist < reach) {
          const pull = (1 - dist / reach) * strength;
          el.style.transform = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px)`;
        } else if (el.style.transform) {
          el.style.transform = "";
        }
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [strength, radius]);

  return (
    <div ref={ref} className={cn("magnetic", className)} data-magnetic>
      {children}
    </div>
  );
}

/* ── useSectionProgress — writes scroll progress (0..1) to --sp on the node ──
   and returns a quantized stage for step-by-step sections. Continuous values
   (painted rails, now-lines) read var(--sp) in CSS — no React re-renders;
   only the discrete stage triggers renders. */
export function useSectionProgress<T extends HTMLElement>(steps = 0, lead = 0.85) {
  const ref = useRef<T | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--sp", "1");
      const id = requestAnimationFrame(() => setStage(steps));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * lead - r.top) / Math.max(r.height, 1)));
      el.style.setProperty("--sp", p.toFixed(4));
      if (steps > 0) setStage(Math.min(steps, Math.floor(p * (steps + 0.999))));
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
  }, [steps, lead]);

  return { ref, stage };
}

/* ── useParallax — gentle counter-scroll drift on two refs (demo columns) ──── */
export function useParallax(amount = 16) {
  const aRef = useRef<HTMLDivElement | null>(null);
  const bRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    if (prefersReducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) return;

    let raf = 0;
    const update = () => {
      const r = a.parentElement!.getBoundingClientRect();
      const vh = window.innerHeight;
      const off = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 around center
      a.style.transform = `translateY(${(off * amount).toFixed(1)}px)`;
      b.style.transform = `translateY(${(off * -amount).toFixed(1)}px)`;
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
  }, [amount]);

  return { aRef, bRef };
}

/* ── MagneticCursor — soft coral ring trailing the pointer, grows near
   interactive elements. Desktop (fine pointer) only; native cursor stays. ─── */
export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(FINE_QUERY).matches || prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100, y = -100, rx = -100, ry = -100;
    let scaleTarget = 1, scale = 1;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const t = e.target as Element | null;
      scaleTarget = t?.closest?.("a, button, [data-magnetic], input, textarea, select, summary, .tilt-card") ? 2.4 : 1;
    };
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      scale += (scaleTarget - scale) * 0.14;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}

/* ── ScrollProgressBar — hairline coral read-progress under the header ─────── */
export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
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
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden />;
}
