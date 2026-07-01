"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/stripe/plans";

interface CheckoutButtonProps {
  planId: Plan["id"];
  label: string;
  featured?: boolean;
  className?: string;
}

export function CheckoutButton({ planId, label, featured, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (planId === "solo") {
      window.location.href = "/signup";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        // Stripe not configured → fall through to signup
        window.location.href = "/signup?plan=" + planId;
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = "/signup?plan=" + planId;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all disabled:opacity-70",
        featured
          ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
          : "border border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
