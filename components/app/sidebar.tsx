"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Settings, LifeBuoy, LogOut, X, Zap, ChevronDown } from "lucide-react";
import appConfig from "@/app.config";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { PLAN_LABEL, type Plan } from "@/lib/demo/data";
import { useWorkspace, initialsOf } from "@/components/app/workspace-context";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  onAiOpen?: () => void;
}

const PLANS: Plan[] = ["solo", "pro", "isletme"];

export function Sidebar({ open, onClose, onAiOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t, lang } = useLang();
  const { plan: activePlan, setPlan: setActivePlan, isDemo, business } = useWorkspace();
  const [planOpen, setPlanOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 md:relative md:flex md:translate-x-0",
      open ? "flex translate-x-0" : "-translate-x-full md:translate-x-0 hidden md:flex",
    )}>
      {/* Brand */}
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="inline-flex" onClick={onClose}>
          <Logo withChevron />
        </Link>
        <button
          onClick={onClose}
          className="ml-auto grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* AI Search pill */}
      <div className="px-3 pb-2">
        <button
          onClick={onAiOpen}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{lang === "tr" ? "AI ile ara" : "AI Search"}</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {appConfig.navGroups.map((group) => (
          <div key={t(group.label)} className="mb-4">
            <p className="label-mono px-3 pb-1.5 pt-2 text-sidebar-muted">{t(group.label)}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = !item.muted && isActive(item.href);
                const inner = (
                  <>
                    <Icon
                      name={item.icon}
                      className={cn("h-[17px] w-[17px] shrink-0", active ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="truncate">{t(item.label)}</span>
                    {item.muted && (
                      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {lang === "tr" ? "yakında" : "soon"}
                      </span>
                    )}
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                        {t(item.badge)}
                      </span>
                    )}
                  </>
                );
                if (item.muted) {
                  return (
                    <span
                      key={t(item.label)}
                      className="group flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-sidebar-muted"
                    >
                      {inner}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      active ? "nav-pill-active text-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Active plan badge + demo switcher */}
      <div className="mx-3 mb-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">
              {PLAN_LABEL[activePlan][lang]} {lang === "tr" ? "Paket" : "Plan"}
            </span>
          </div>
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
            {lang === "tr" ? "AKTİF" : "ACTIVE"}
          </span>
        </div>
        {activePlan !== "isletme" && (
          <Link href="/#pricing" className="mt-1.5 block text-[11px] text-primary/70 hover:text-primary hover:underline">
            {lang === "tr" ? "İşletme paketine geç →" : "Upgrade to Business →"}
          </Link>
        )}
        {/* Plan switcher — demo showcase, or instant plan change until Stripe is wired */}
        <div className="relative mt-2">
          <button
            onClick={() => setPlanOpen((v) => !v)}
            className="flex w-full items-center gap-1 rounded-lg border border-border bg-card/60 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <span className="flex-1 text-left">
              {isDemo
                ? lang === "tr" ? "Demo: paketi değiştir" : "Demo: switch plan"
                : lang === "tr" ? "Paketi değiştir" : "Change plan"}
            </span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", planOpen && "rotate-180")} />
          </button>
          {planOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-xl border border-border bg-card shadow-pop">
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setActivePlan(p); setPlanOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-muted",
                    activePlan === p ? "font-semibold text-primary" : "text-foreground/70",
                  )}
                >
                  {activePlan === p && <Zap className="h-3 w-3 text-primary" />}
                  {PLAN_LABEL[p][lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings + Support */}
      <div className="space-y-0.5 px-3 pb-2">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
            isActive("/settings") ? "nav-pill-active text-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="h-[17px] w-[17px] text-muted-foreground" />
          {lang === "tr" ? "Ayarlar" : "Settings"}
        </Link>
        <a
          href={`mailto:destek@${appConfig.domain}?subject=${encodeURIComponent(`${appConfig.name} destek`)}`}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <LifeBuoy className="h-[17px] w-[17px] text-muted-foreground" />
          {lang === "tr" ? "Destek" : "Support"}
        </a>
      </div>

      {/* Pinned user card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-2.5 py-2 shadow-pill">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
            {initialsOf(business.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{business.name}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{business.email}</p>
          </div>
          <Link
            href="/login"
            aria-label={lang === "tr" ? "Çıkış" : "Log out"}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
