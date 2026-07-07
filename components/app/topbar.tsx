"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Bell, Plus, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import appConfig from "@/app.config";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";
import { useWorkspace } from "@/components/app/workspace-context";
import { useNewAppointment } from "@/components/app/forms";
import { cn, formatRelative } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
}

const emptySubscribe = () => () => {};
/** true after hydration, false during SSR — no effect/setState needed. */
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { t, lang } = useLang();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const { activity } = useWorkspace();
  const newAppt = useNewAppointment();
  const [notifOpen, setNotifOpen] = useState(false);
  const current =
    appConfig.nav.find((n) => pathname === n.href || pathname.startsWith(n.href + "/")) ??
    appConfig.navGroups.flatMap((g) => g.items).find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="font-display text-[15px] font-semibold tracking-tight md:hidden">
        {current ? t(current.label) : appConfig.name}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => newAppt.open()}
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {lang === "tr" ? "Randevu" : "New booking"}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {mounted && theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
        <LanguageToggle className="mr-1" />
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            {activity.length > 0 && (
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-40 w-80 animate-pop overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
                <p className="border-b border-border px-4 py-2.5 text-[12px] font-semibold text-muted-foreground">
                  {lang === "tr" ? "Bildirimler" : "Notifications"}
                </p>
                <div className="max-h-80 overflow-y-auto p-2">
                  {activity.length === 0 && (
                    <p className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">
                      {lang === "tr" ? "Henüz bildirim yok." : "No notifications yet."}
                    </p>
                  )}
                  {activity.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-muted/60">
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          a.tone === "success" ? "bg-success" : a.tone === "warning" ? "bg-warning" : a.tone === "info" ? "bg-info" : "bg-muted-foreground",
                        )}
                      />
                      <div className="min-w-0 text-[12.5px]">
                        <p className="leading-snug">
                          <span className="font-semibold">{a.who}</span>{" "}
                          <span className="text-muted-foreground">{t(a.action)}</span>{" "}
                          <span className="font-medium">{a.target}</span>
                        </p>
                        <p className="text-[10.5px] text-muted-foreground">{formatRelative(a.at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
