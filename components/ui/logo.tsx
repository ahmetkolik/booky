import { cn } from "@/lib/utils";
import appConfig from "@/app.config";

/**
 * Booky brand mark — a bespoke inline-SVG logomark: a rounded calendar tile
 * (the booking page) with a header bar + binding tabs, holding a checkmark
 * (the confirmed appointment), all in a coral→pink gradient. No external image.
 * The setup can swap `appConfig.name` for the wordmark; drop a real file at
 * public/logo.svg if you have one.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8 shrink-0", className)}
      aria-hidden
      fill="none"
    >
      <defs>
        <linearGradient id="booky-mark" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(74% 0.15 16)" />
          <stop offset="1" stopColor="oklch(62% 0.17 350)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#booky-mark)" />
      {/* calendar header bar */}
      <path d="M8 12.5 H24" stroke="#fff" strokeOpacity="0.42" strokeWidth="1.4" strokeLinecap="round" />
      {/* binding tabs */}
      <rect x="11" y="6.4" width="1.8" height="4" rx="0.9" fill="#fff" fillOpacity="0.85" />
      <rect x="19.2" y="6.4" width="1.8" height="4" rx="0.9" fill="#fff" fillOpacity="0.85" />
      {/* confirmed checkmark (the booking) */}
      <path
        d="M12 18.4 L15 21.4 L20.4 15.4"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  withChevron = false,
  onDark = false,
}: {
  className?: string;
  withWordmark?: boolean;
  /** Render a small chevron after the wordmark (matches the sidebar header). */
  withChevron?: boolean;
  /** Use a light wordmark on a dark surface (e.g. the auth brand panel). */
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 shadow-pill" />
      {withWordmark && (
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "font-display text-[18px] font-bold tracking-[-0.02em]",
              onDark ? "text-white" : "text-foreground",
            )}
          >
            {appConfig.name}
          </span>
          {withChevron && (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted-foreground" aria-hidden>
              <path d="M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
      )}
    </span>
  );
}
