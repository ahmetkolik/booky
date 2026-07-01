import type { ReactNode } from "react";

/** Minimal shell for public-facing pages (booking, confirmation). No auth, no sidebar. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
