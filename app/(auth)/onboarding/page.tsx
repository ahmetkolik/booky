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
import { createFreshWorkspace, readPendingSignup } from "@/components/app/workspace-context";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

/* Every appointment-based business type we know of. Rendered alphabetically
   in the active language; "other" lives in a free-text input below the grid. */
const CATEGORIES: { id: string; icon: string; label: { tr: string; en: string } }[] = [
  { id: "akupunktur", icon: "leaf", label: { tr: "Akupunktur", en: "Acupuncture" } },
  { id: "arac-yikama", icon: "droplets", label: { tr: "Araç yıkama & Detailing", en: "Car wash & Detailing" } },
  { id: "avukat", icon: "scale", label: { tr: "Avukat & Hukuk bürosu", en: "Lawyer & Law firm" } },
  { id: "berber", icon: "scissors", label: { tr: "Berber", en: "Barber" } },
  { id: "cilt-bakimi", icon: "sparkles", label: { tr: "Cilt bakımı & Estetik", en: "Skincare & Aesthetics" } },
  { id: "cocuk-gelisimi", icon: "baby", label: { tr: "Çocuk gelişimi & Pedagog", en: "Child development & Pedagogy" } },
  { id: "dans", icon: "footprints", label: { tr: "Dans & Bale stüdyosu", en: "Dance & Ballet studio" } },
  { id: "dis", icon: "smile", label: { tr: "Diş kliniği", en: "Dental clinic" } },
  { id: "diyetisyen", icon: "salad", label: { tr: "Diyetisyen & Beslenme", en: "Dietitian & Nutrition" } },
  { id: "doktor", icon: "stethoscope", label: { tr: "Doktor & Poliklinik", en: "Doctor & Medical clinic" } },
  { id: "dovme", icon: "pen-tool", label: { tr: "Dövme & Piercing", en: "Tattoo & Piercing" } },
  { id: "dugun-etkinlik", icon: "calendar-heart", label: { tr: "Düğün & Etkinlik planlama", en: "Wedding & Event planning" } },
  { id: "emlak", icon: "house", label: { tr: "Emlak danışmanı", en: "Real estate agent" } },
  { id: "ev-temizligi", icon: "spray-can", label: { tr: "Ev & Ofis temizliği", en: "Home & Office cleaning" } },
  { id: "pet-kuafor", icon: "paw-print", label: { tr: "Evcil hayvan kuaförü", en: "Pet grooming" } },
  { id: "finans", icon: "calculator", label: { tr: "Finansal danışman & Muhasebe", en: "Financial advisor & Accounting" } },
  { id: "fizyoterapi", icon: "activity", label: { tr: "Fizyoterapi & Rehabilitasyon", en: "Physiotherapy & Rehab" } },
  { id: "fotograf", icon: "camera", label: { tr: "Fotoğraf stüdyosu", en: "Photography studio" } },
  { id: "kirpik-kas", icon: "eye", label: { tr: "Kirpik & Kaş tasarımı", en: "Lashes & Brows" } },
  { id: "kiropraktik", icon: "bone", label: { tr: "Kiropraktik & Osteopati", en: "Chiropractic & Osteopathy" } },
  { id: "antrenor", icon: "dumbbell", label: { tr: "Kişisel antrenör & Fitness", en: "Personal trainer & Fitness" } },
  { id: "kuafor", icon: "wand-sparkles", label: { tr: "Kuaför & Güzellik salonu", en: "Hair & Beauty salon" } },
  { id: "lazer-epilasyon", icon: "zap", label: { tr: "Lazer & Epilasyon", en: "Laser & Hair removal" } },
  { id: "makyaj", icon: "palette", label: { tr: "Makyaj sanatçısı", en: "Makeup artist" } },
  { id: "manikur", icon: "hand", label: { tr: "Manikür & Pedikür", en: "Nail studio" } },
  { id: "masaj", icon: "flower", label: { tr: "Masaj terapisti", en: "Massage therapist" } },
  { id: "muzik-dersi", icon: "music", label: { tr: "Müzik dersi", en: "Music lessons" } },
  { id: "optik", icon: "glasses", label: { tr: "Optik & Göz sağlığı", en: "Optometry & Eyewear" } },
  { id: "oto-servis", icon: "wrench", label: { tr: "Oto servis & Bakım", en: "Auto service & Repair" } },
  { id: "ozel-ders", icon: "graduation-cap", label: { tr: "Özel ders & Eğitmen", en: "Tutoring & Instructors" } },
  { id: "pilates-yoga", icon: "person-standing", label: { tr: "Pilates & Yoga stüdyosu", en: "Pilates & Yoga studio" } },
  { id: "psikolog", icon: "brain", label: { tr: "Psikolog & Terapist", en: "Psychologist & Therapist" } },
  { id: "solaryum", icon: "sun", label: { tr: "Solaryum & Bronzlaşma", en: "Tanning studio" } },
  { id: "spa", icon: "flower-2", label: { tr: "Spa & Hamam", en: "Spa & Bath" } },
  { id: "spor-tesisi", icon: "trophy", label: { tr: "Spor tesisi & Saha kiralama", en: "Sports facility & Court rental" } },
  { id: "surucu-kursu", icon: "car-front", label: { tr: "Sürücü kursu", en: "Driving school" } },
  { id: "terzi", icon: "shirt", label: { tr: "Terzi & Prova", en: "Tailor & Fittings" } },
  { id: "tesisat-tamir", icon: "hammer", label: { tr: "Tesisat & Tamir hizmetleri", en: "Plumbing & Repair services" } },
  { id: "veteriner", icon: "dog", label: { tr: "Veteriner kliniği", en: "Veterinary clinic" } },
  { id: "yasam-kocu", icon: "compass", label: { tr: "Yaşam koçu & Mentorluk", en: "Life coach & Mentoring" } },
  { id: "yuzme", icon: "waves", label: { tr: "Yüzme dersi", en: "Swimming lessons" } },
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
  const { lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  /** Free-text business type — used when none of the cards fit. */
  const [customType, setCustomType] = useState("");

  const sortedCategories = [...CATEGORIES].sort((a, b) =>
    a.label[lang].localeCompare(b.label[lang], lang),
  );
  const categoryLabel = customType.trim()
    ? customType.trim()
    : CATEGORIES.find((c) => c.id === category)?.label[lang] ?? null;

  function handleNameChange(val: string) {
    setBusinessName(val);
    if (!slugEdited) setSlug(toSlug(val));
  }

  function handleSlugChange(val: string) {
    setSlug(toSlug(val));
    setSlugEdited(true);
  }

  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);
    const pending = readPendingSignup();

    if (supabaseConfigured) {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { error: insertError } = await supabase.from("businesses").insert({
          owner_id: session.user.id,
          slug: slug.trim(),
          name: businessName.trim(),
          category: categoryLabel ?? "",
          contact_email: pending?.email || session.user.email,
          owner_name: pending?.name || businessName.trim(),
          plan: pending?.plan ?? "solo",
        });
        if (insertError) {
          setError(
            insertError.code === "23505"
              ? lang === "tr"
                ? "Bu rezervasyon URL'si zaten alınmış, başka bir tane dene."
                : "That booking URL is already taken — try another."
              : insertError.message,
          );
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        return;
      }
    }

    // No Supabase session — fall back to the local "fresh" workspace.
    createFreshWorkspace({
      name: businessName.trim(),
      slug: slug.trim(),
      category: categoryLabel ?? "",
      email: pending?.email,
      owner: pending?.name || businessName.trim(),
      plan: pending?.plan,
    });
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

            <div className="max-h-[46dvh] overflow-y-auto rounded-xl border border-border bg-card p-2">
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {sortedCategories.map((c) => {
                  const active = category === c.id && !customType.trim();
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setCategory(c.id); setCustomType(""); }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                        <Icon name={c.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-[12.5px] font-semibold leading-tight">{c.label[lang]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual entry — for types not on the list */}
            <div className="space-y-1.5">
              <Label htmlFor="custom-type">
                {lang === "tr" ? "Listede yok mu? Kendin yaz" : "Not on the list? Type your own"}
              </Label>
              <Input
                id="custom-type"
                placeholder={lang === "tr" ? "örn. Seramik atölyesi, astroloji danışmanlığı…" : "e.g. Pottery workshop, astrology consulting…"}
                value={customType}
                onChange={(e) => { setCustomType(e.target.value); if (e.target.value.trim()) setCategory(null); }}
              />
              {customType.trim() && (
                <p className="text-[11.5px] text-muted-foreground">
                  {lang === "tr" ? `Tür olarak "${customType.trim()}" kullanılacak.` : `We'll use "${customType.trim()}" as your type.`}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                {lang === "tr" ? "Geri" : "Back"}
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!category && !customType.trim()}
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
                value={categoryLabel ?? "—"}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
            )}
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
