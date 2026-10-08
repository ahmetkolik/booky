"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { AiSearch } from "@/components/app/ai-search";
import { WorkspaceProvider, useWorkspace } from "@/components/app/workspace-context";
import { useLang } from "@/components/i18n/language-provider";

/** Live mode: a failed save is shown, not silently swallowed. */
function LiveErrorBanner() {
  const { liveError, clearLiveError } = useWorkspace();
  const { lang } = useLang();
  if (!liveError) return null;
  return (
    <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
      <span className="flex-1">
        <strong>{lang === "tr" ? "Değişiklik kaydedilemedi." : "Your change wasn't saved."}</strong>{" "}
        <span className="opacity-80">{liveError}</span>
      </span>
      <button onClick={clearLiveError} className="shrink-0 text-[12px] font-medium underline">
        {lang === "tr" ? "Kapat" : "Dismiss"}
      </button>
    </div>
  );
}
import { NewAppointmentProvider } from "@/components/app/forms";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAiOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <WorkspaceProvider>
    <NewAppointmentProvider>
    <div className="flex h-dvh overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onAiOpen={() => setAiOpen(true)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <LiveErrorBanner />
          {children}
        </main>
      </div>

      <AiSearch open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
    </NewAppointmentProvider>
    </WorkspaceProvider>
  );
}
