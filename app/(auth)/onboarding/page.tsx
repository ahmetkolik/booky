"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const CATEGORIES: { id: string; icon: string; label: { tr: string; en: string } }[] = [
  { id: "salon", icon: "scissors", label: { tr: "Salon & Berber", en: "Salon & Barber" } },
  { id: "spa", icon: "flower", label: { tr: "Spa & Masaj", en: "Spa & Massage" } },
  { id: "fitness", icon: "dumbbell", label: { tr: "Antrenör & Stüdyo", en: "Trainer & Studio" } },
  { id: "klinik", icon: "stethoscope", label: { tr: "Klinik & Danışman", en: "Clinic & Consultant" } },
];

function toSlug(val: string): string {
  return val
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OnboardingPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setBusinessName(val);
    if (!slugEdited) setSlug(toSlug(val));
  }

  function handleSlugChange(val: string) {
    setSlug(toSlug(val));
    setSlugEdited(true);
  }

  function finish() {
    setLoading(true);
    // With Supabase this creates the business record + sets the slug
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <header className="flex h-14 items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageToggle />
      </header>

      {/* Progress */}
      <div className="mx-auto mt-4 max-w-lg px-6">
        <div className="flex items-center gap-2">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  step > n
                    ? "bg-success text-white"
                    : step === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {step > n ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              {n < 3 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {lang === "tr" ? `Adım ${step} / 3` : `Step ${step} / 3`}
        </p>
      </div>

      <main className="mx-auto max-w-lg px-6 py-10">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "İşletmeni tanıtalım" : "Tell us about your business"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {lang === "tr" ? "Bu bilgiler rezervasyon sayfanda görünecek." : "This info will appear on your booking page."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bname">{lang === "tr" ? "İşletme adı" : "Business name"}</Label>
              <Input
                id="bname"
                placeholder={lang === "tr" ? "örn. Glow Studio" : "e.g. Glow Studio"}
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">
                {lang === "tr" ? "Rezervasyon URL'si" : "Booking URL"}
              </Label>
              <div className="flex items-center rounded-lg border border-border bg-muted">
                <span className="select-none px-3 text-sm text-muted-foreground">
                  {typeof window !== "undefined" ? window.location.host : "app.com"}/book/
                </span>
                <input
                  id="slug"
                  className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none"
                  placeholder="glow-studio"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>
              {slug && (
                <p className="text-[11.5px] text-muted-foreground">
                  {lang === "tr" ? "Müşterilerine bu linki vereceksin." : "You'll share this link with your clients."}
                </p>
              )}
            </div>

            <Button
              className="w-full gap-2"
              disabled={!businessName.trim() || !slug.trim()}
              onClick={() => setStep(2)}
            >
              {lang === "tr" ? "Devam et" : "Continue"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "İşletme türü" : "Business type"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {lang === "tr" ? "Takvim ve şablonları buna göre ayarlayalım." : "We'll tailor your calendar and templates."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    category === c.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-foreground">
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">{lang === "tr" ? c.label.tr : c.label.en}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                {lang === "tr" ? "Geri" : "Back"}
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!category}
                onClick={() => setStep(3)}
              >
                {lang === "tr" ? "Devam et" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "Her şey hazır 🎉" : "You're all set 🎉"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Rezervasyon sayfan hazır, müşterilerini bekliyor."
                  : "Your booking page is ready and waiting for clients."}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5">
              <SummaryRow
                label={lang === "tr" ? "İşletme adı" : "Business name"}
                value={businessName || "—"}
              />
              <SummaryRow
                label={lang === "tr" ? "Rezervasyon URL" : "Booking URL"}
                value={`/book/${slug || "—"}`}
              />
              <SummaryRow
                label={lang === "tr" ? "Tür" : "Category"}
                value={CATEGORIES.find((c) => c.id === category)?.[lang === "tr" ? "label" : "label"]?.[lang] ?? "—"}
              />
            </div>

            <Button className="w-full gap-2" onClick={finish} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {lang === "tr" ? "Panele git" : "Go to dashboard"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
