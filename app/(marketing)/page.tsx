"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  ShieldCheck,
  Zap,
  CalendarCheck,
  BellRing,
  CreditCard,
  Link2,
  Sparkles,
} from "lucide-react";
import appConfig from "@/app.config";
import { Icon } from "@/components/ui/icon";
import { BookingDemo } from "@/components/marketing/booking-demo";
import { ProductPreview, CompanyMark, Stars } from "@/components/marketing/marks";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { L } from "@/lib/i18n/config";

/* ─────────────────────────────────────────────────────────────────────────────
   Local bilingual copy that doesn't belong in app.config.ts. Everything here is
   { tr, en } and resolved through the active language via t().
   ───────────────────────────────────────────────────────────────────────────── */

const HERO_BENEFITS: L[] = [
  { tr: "Paylaşılabilir rezervasyon sayfası — 7/24 açık", en: "A shareable booking page — open 24/7" },
  { tr: "Otomatik hatırlatmalar gelmeyen oranını düşürür", en: "Automatic reminders cut your no-shows" },
  { tr: "Depozitolar ve ödemeler doğrudan Stripe'ına gelir", en: "Deposits and payments land in your Stripe" },
];

const TRUSTED = ["Fade & Bıyık", "Glow Studio", "Serenity Spa", "PeakFit", "Nail Bar", "Dermis Klinik", "Kuaför Selin", "Pilates House"];

const HOW_STEPS: { n: string; icon: string; title: L; body: L }[] = [
  {
    n: "01",
    icon: "scissors",
    title: { tr: "Hizmetlerini ekle", en: "Set your services" },
    body: { tr: "Süre, fiyat ve depozitoyla hizmetlerini gir; personelini ve çalışma saatlerini ayarla.", en: "Add services with duration, price and a deposit; set up your staff and their working hours." },
  },
  {
    n: "02",
    icon: "share-2",
    title: { tr: "Linkini paylaş", en: "Share your link" },
    body: { tr: "Markalı rezervasyon sayfanı Instagram bio'na, WhatsApp'a ya da siteye koy. Uygulama gerekmez.", en: "Drop your branded booking page in your Instagram bio, WhatsApp or website. No app needed." },
  },
  {
    n: "03",
    icon: "calendar-check",
    title: { tr: "Müşteriler rezerve etsin", en: "Clients book themselves" },
    body: { tr: "Müşteriler uygun saati seçer, depozitoyu öder; randevu takvimine düşer ve çakışmaz.", en: "Clients pick an open time and pay the deposit; the slot lands on your calendar, never double-booked." },
  },
  {
    n: "04",
    icon: "credit-card",
    title: { tr: "Ödemeni al", en: "Get paid" },
    body: { tr: "Hizmetten sonra bakiyeyi tahsil et; gelmeyen müşteriden depozito otomatik kalır.", en: "Collect the balance after the service; keep the deposit automatically if they no-show." },
  },
];

type CompareValue = boolean | L | string;
const COMPARE: { feature: L; phone: CompareValue; generic: CompareValue; booky: CompareValue }[] = [
  { feature: { tr: "7/24 online rezervasyon", en: "24/7 online booking" }, phone: false, generic: true, booky: true },
  { feature: { tr: "Personel takvimleri", en: "Per-staff calendars" }, phone: { tr: "Kağıt", en: "On paper" }, generic: { tr: "Kısıtlı", en: "Limited" }, booky: true },
  { feature: { tr: "Depozito al", en: "Take deposits" }, phone: false, generic: { tr: "Eklenti", en: "Add-on" }, booky: true },
  { feature: { tr: "Gelmeyen ücreti", en: "No-show fees" }, phone: false, generic: false, booky: true },
  { feature: { tr: "SMS + e-posta hatırlatma", en: "SMS + email reminders" }, phone: { tr: "Manuel", en: "Manual" }, generic: { tr: "Sadece e-posta", en: "Email only" }, booky: true },
  { feature: { tr: "Müşteri geçmişi & notlar", en: "Client history & notes" }, phone: false, generic: { tr: "Kısmi", en: "Partial" }, booky: true },
  { feature: { tr: "Takvim senkronu", en: "Calendar sync" }, phone: false, generic: true, booky: true },
  { feature: { tr: "Rezervasyon komisyonu", en: "Booking commission" }, phone: { tr: "—", en: "—" }, generic: "10–30%", booky: { tr: "0%", en: "0%" } },
];

const TESTIMONIALS: { quote: L; name: string; role: L; initials: string; metric: L }[] = [
  { quote: { tr: "Telefonda randevu almayı bıraktık. Müşteriler kendileri rezerve ediyor, ben sadece kesiyorum.", en: "We stopped taking bookings by phone. Clients book themselves and I just cut hair." }, name: "Mert Kaya", role: { tr: "Sahibi · Fade & Co", en: "Owner · Fade & Co" }, initials: "MK", metric: { tr: "Haftada 6s geri", en: "6h/wk saved" } },
  { quote: { tr: "Depozito şartı koyduktan sonra gelmeyen müşteri neredeyse bitti. İlk ayda %40 düştü.", en: "Requiring a deposit nearly ended no-shows. Down 40% in the first month." }, name: "Selin Aydın", role: { tr: "Stilist · Glow Studio", en: "Stylist · Glow Studio" }, initials: "SA", metric: { tr: "-%40 no-show", en: "-40% no-shows" } },
  { quote: { tr: "Dört terapistin takvimini tek ekranda görüyorum. Çakışma derdi tamamen bitti.", en: "I see all four therapists' calendars on one screen. Double-bookings are gone." }, name: "Aylin Demir", role: { tr: "Müdür · Serenity Spa", en: "Manager · Serenity Spa" }, initials: "AD", metric: { tr: "0 çakışma", en: "0 conflicts" } },
  { quote: { tr: "SMS hatırlatmalar müşterileri geri getiriyor. Boş saatler bekleme listesiyle doluyor.", en: "SMS reminders bring clients back, and open slots fill from the waitlist automatically." }, name: "Cem Yıldız", role: { tr: "Antrenör · PeakFit", en: "Trainer · PeakFit" }, initials: "CY", metric: { tr: "%92 doluluk", en: "92% utilization" } },
  { quote: { tr: "Instagram bio'ma linki koydum, ertesi sabah 11 yeni rezervasyon vardı.", en: "I put the link in my Instagram bio and woke up to 11 new bookings." }, name: "Naz Yılmaz", role: { tr: "Sahibi · Nail Bar", en: "Owner · Nail Bar" }, initials: "NY", metric: { tr: "1 gecede +11", en: "+11 overnight" } },
  { quote: { tr: "Ödemeler doğrudan kendi Stripe hesabıma geliyor. Booky araya hiç komisyon koymuyor.", en: "Payments go straight to my own Stripe. Booky takes no commission in between." }, name: "Onur Kılıç", role: { tr: "Klinik · Calm Clinic", en: "Clinic · Calm Clinic" }, initials: "OK", metric: { tr: "%0 komisyon", en: "0% commission" } },
];

const SECURITY: { icon: typeof ShieldCheck; title: L; body: L }[] = [
  { icon: CreditCard, title: { tr: "Depozito al", en: "Require a deposit" }, body: { tr: "Rezervasyonda küçük bir depozito iste — gelmeyen müşteri için ücreti otomatik tut.", en: "Ask for a small deposit at booking — keep it as a fee automatically if they don't show." } },
  { icon: BellRing, title: { tr: "Akıllı hatırlatma", en: "Smart reminders" }, body: { tr: "Randevudan 24 saat ve 2 saat önce SMS + e-posta. Tek tıkla onayla veya yeniden planla.", en: "SMS + email 24h and 2h before. One tap to confirm or reschedule." } },
  { icon: Zap, title: { tr: "Bekleme listesi", en: "Auto waitlist" }, body: { tr: "Bir iptal olduğunda boş saat bekleyen müşterilere otomatik teklif edilir.", en: "When a slot opens, it's auto-offered to waitlisted clients in seconds." } },
];

const USE_CASES: { icon: string; title: L; body: L }[] = [
  { icon: "scissors", title: { tr: "Salon & berber", en: "Salons & barbers" }, body: { tr: "Her koltuk için ayrı takvim, hizmet menüsü ve depozitolu rezervasyon.", en: "A calendar per chair, a service menu, and deposit-backed bookings." } },
  { icon: "flower", title: { tr: "Spa & masaj", en: "Spa & massage" }, body: { tr: "Oda ve terapist müsaitliği, paketler ve mola payları tek panelde.", en: "Room and therapist availability, packages and buffers in one panel." } },
  { icon: "dumbbell", title: { tr: "Antrenör & stüdyo", en: "Trainers & studios" }, body: { tr: "Birebir seanslar veya grup dersleri; tekrar eden rezervasyonlar.", en: "1:1 sessions or group classes; recurring bookings made easy." } },
  { icon: "stethoscope", title: { tr: "Klinik & danışman", en: "Clinics & consultants" }, body: { tr: "Konsültasyon rezervasyonu, müşteri notları ve hatırlatmalar.", en: "Consultation booking, client notes and reminders that stick." } },
];

const DEEP_DIVE_POINTS: L[] = [
  { tr: "Rezervasyonda yüzde veya sabit tutar depozito", en: "Percentage or flat-amount deposit at booking" },
  { tr: "Gelmeyen / geç iptal için otomatik ücret", en: "Automatic fee for no-shows and late cancels" },
  { tr: "İade ve istisna kuralları senin kontrolünde", en: "Refund and exception rules under your control" },
  { tr: "Tüm ödemeler kendi Stripe hesabına", en: "Every payment to your own Stripe account" },
];

/* Calendar showcase points (alternating deep-dive). */
const CALENDAR_POINTS: { icon: string; title: L; body: L }[] = [
  { icon: "columns-3", title: { tr: "Personel sütunları", en: "Staff columns" }, body: { tr: "Her personel kendi sütununda; gün boyunca herkesin doluluğunu tek bakışta gör.", en: "Each member in their own column; see everyone's day at a glance." } },
  { icon: "shield-check", title: { tr: "Çakışma koruması", en: "No double-booking" }, body: { tr: "Mola payları ve hazırlık süreleriyle iki müşteri asla aynı saate denk gelmez.", en: "Buffers and prep times mean two clients never land on the same slot." } },
  { icon: "refresh-cw", title: { tr: "Takvim senkronu", en: "Calendar sync" }, body: { tr: "Google ve Apple Takvim ile çift yönlü senkron — kişisel planın da korunur.", en: "Two-way Google & Apple Calendar sync — your personal plans stay protected." } },
];

/* Reminder timeline steps. */
const REMINDER_TIMELINE: { when: L; title: L; body: L; tone: string }[] = [
  { when: { tr: "Rezervasyon anı", en: "On booking" }, title: { tr: "Onay + takvime ekle", en: "Confirmation + add to calendar" }, body: { tr: "Müşteri anında SMS ve e-posta onayı alır, tek tıkla takvimine ekler.", en: "The client gets an instant SMS + email confirmation and a one-tap calendar add." }, tone: "var(--color-success)" },
  { when: { tr: "24 saat önce", en: "24h before" }, title: { tr: "Hatırlatma", en: "Reminder" }, body: { tr: "Nazik bir hatırlatma gider; gelemiyorsa tek tıkla yeniden planlar.", en: "A gentle reminder goes out; if they can't make it, they reschedule in one tap." }, tone: "var(--color-info)" },
  { when: { tr: "2 saat önce", en: "2h before" }, title: { tr: "Son SMS", en: "Final SMS" }, body: { tr: "Yol tarifi ve onay linkiyle son bir SMS — gelmeyen sayısı düşer.", en: "A final SMS with directions and a confirm link — no-shows drop." }, tone: "var(--color-primary)" },
  { when: { tr: "Sonrasında", en: "After" }, title: { tr: "Teşekkür + yeniden rezervasyon", en: "Thanks + rebook" }, body: { tr: "Teşekkür mesajı ve bir sonraki randevu için hazır bir link gönderilir.", en: "A thank-you and a ready-made link to book the next visit." }, tone: "var(--seg-2)" },
];

const CX_POINTS: { icon: string; title: L; body: L }[] = [
  { icon: "smartphone", title: { tr: "Uygulama yok", en: "No app" }, body: { tr: "Mobil uyumlu sayfa; tarayıcıda açılır.", en: "A mobile-first page; opens in any browser." } },
  { icon: "zap", title: { tr: "Anında onay", en: "Instant confirm" }, body: { tr: "SMS + e-posta saniyeler içinde gelir.", en: "SMS + email arrive in seconds." } },
  { icon: "calendar-plus", title: { tr: "Takvime ekle", en: "Add to calendar" }, body: { tr: "Tek dokunuşla kendi takvimine kaydeder.", en: "Saves to their own calendar in one tap." } },
];

const INCLUDED: L[] = [
  { tr: "Sınırsız hizmet & kategori", en: "Unlimited services & categories" },
  { tr: "Markalı rezervasyon sayfası", en: "Branded booking page" },
  { tr: "Personel başına çalışma saatleri", en: "Per-staff working hours" },
  { tr: "Mola payları & hazırlık süresi", en: "Buffers & prep time" },
  { tr: "Çakışma koruması", en: "Double-booking protection" },
  { tr: "SMS + e-posta hatırlatmalar", en: "SMS + email reminders" },
  { tr: "Depozito & no-show ücreti", en: "Deposits & no-show fees" },
  { tr: "Müşteri kartları & notlar", en: "Client cards & notes" },
  { tr: "Bekleme listesi", en: "Waitlist" },
  { tr: "Google/Apple takvim senkronu", en: "Google/Apple calendar sync" },
  { tr: "Gelir & doluluk raporları", en: "Revenue & utilization reports" },
  { tr: "Mobil uyumlu yönetim paneli", en: "Mobile-friendly dashboard" },
];

const INTEGRATIONS: { name: string; desc: L; icon: string }[] = [
  { name: "Stripe", desc: { tr: "Depozito & ödeme", en: "Deposits & payments" }, icon: "credit-card" },
  { name: "Supabase", desc: { tr: "Veritabanı & giriş", en: "Database & auth" }, icon: "database" },
  { name: "Google Calendar", desc: { tr: "Takvim senkronu", en: "Calendar sync" }, icon: "calendar" },
  { name: "Twilio", desc: { tr: "SMS hatırlatma", en: "SMS reminders" }, icon: "message-square" },
];

export default function LandingPage() {
  const { t, lang } = useLang();
  const m = appConfig.marketing;

  const SECTION = {
    demoTitle: { tr: "Müşterinin gördüğü, senin kazandığın", en: "What clients see, what you earn" },
    demoSub: { tr: "Bir hizmet ve saat seç, rezerve et — randevunun panele düşüşünü ve gelirin artışını canlı izle.", en: "Pick a service and a time, then book — watch it land on the dashboard and revenue tick up, live." },
    featuresTitle: { tr: "Rezervasyon işini yürütmek için her şey", en: "Everything to run a booking business" },
    featuresSub: { tr: "Sayfa, takvim, ödeme ve hatırlatma — kutudan çıktığı gibi, eklenti aramadan.", en: "Page, calendar, payments and reminders — out of the box, no add-ons to hunt for." },
    useTitle: { tr: "Hizmet işin için yapıldı", en: "Built for your kind of business" },
    useSub: { tr: "Koltuk, oda ya da seans — Booky doluluğunu yönetir.", en: "Chairs, rooms or sessions — Booky manages your availability." },
    howTitle: { tr: "Dört adımda yayında", en: "Live in four steps" },
    howSub: { tr: "Hizmetlerini ekle, linkini paylaş, müşteriler rezerve etsin, ödemeni al.", en: "Set services, share your link, clients book, you get paid." },
    calEyebrow: { tr: "Takvim", en: "Calendar" },
    calTitle: { tr: "Tüm ekibin, tek takvimde", en: "Your whole team, one calendar" },
    calBody: { tr: "Personel sütunları, hizmete göre renklenen randevu blokları ve çakışma koruması. Günü tek bakışta oku, sürükle-bırak ile düzenle.", en: "Staff columns, appointment blocks colored by service, and double-booking protection. Read the day at a glance and drag to rearrange." },
    cxEyebrow: { tr: "Müşteri deneyimi", en: "Client experience" },
    cxTitle: { tr: "Rezervasyon iki dokunuş kadar kolay", en: "Booking is as easy as two taps" },
    cxBody: { tr: "Müşterilerin uygulama indirmez, hesap açmaz. Linke dokunur, saati seçer, depozitoyu öder — onay anında telefonunda. Sen de panelde görürsün.", en: "Clients install nothing and create no account. They tap your link, pick a time, pay the deposit — confirmation hits their phone instantly. You see it on your dashboard." },
    remEyebrow: { tr: "Hatırlatmalar", en: "Reminders" },
    remTitle: { tr: "Her randevu için akıllı bir akış", en: "A smart sequence for every booking" },
    remSub: { tr: "Onaydan teşekküre — Booky doğru anda doğru mesajı gönderir.", en: "From confirmation to thank-you — Booky sends the right message at the right moment." },
    intTitle: { tr: "Sevdiğin araçlarla çalışır", en: "Works with the tools you use" },
    intSub: { tr: "Anahtarlarını bağla; yoksa demo modda çalışmaya devam eder.", en: "Connect your keys; without them it keeps running in demo mode." },
    inclTitle: { tr: "Her planda dahil", en: "Included on every plan" },
    inclSub: { tr: "Gizli eklenti yok — rezervasyon işini yürütmek için gerekenler kutuda.", en: "No hidden add-ons — what you need to run bookings is in the box." },
    deepEyebrow: { tr: "Gelmeyen müşteri & depozito", en: "No-shows & deposits" },
    deepTitle: { tr: "Boş koltuk para kaybıdır. Booky onu kapatır.", en: "An empty chair is lost money. Booky closes it." },
    deepBody: { tr: "Depozito iste, gelmeyenden ücreti otomatik tut ve boşalan saatleri bekleme listesinden doldur. Gelmeyen oranı düşer, takvim dolu kalır.", en: "Require a deposit, auto-keep a fee on no-shows, and refill open slots from the waitlist. No-shows drop, your calendar stays full." },
    compareTitle: { tr: "Telefon, jenerik araç ve Booky", en: "Phone, generic tools, and Booky" },
    compareSub: { tr: "Neden randevu defterini ya da pahalı bir paketi geride bırakmalısın.", en: "Why you'll leave the appointment book — and the pricey suite — behind." },
    testTitle: { tr: "Salon ve stüdyo sahipleri seviyor", en: "Loved by salon & studio owners" },
    testSub: { tr: "Gerçek işletmeler, gerçek sonuçlar.", en: "Real businesses, real outcomes." },
    pricingTitle: { tr: "Ekibine göre fiyat", en: "Pricing by your team" },
    pricingSub: { tr: "Solo başla, büyüdükçe yükselt. Rezervasyon komisyonu yok.", en: "Start solo, upgrade as you grow. Never a booking commission." },
    popular: { tr: "En popüler", en: "Most popular" },
    faqTitle: { tr: "Sık sorulanlar", en: "Frequently asked" },
    ctaTitle: { tr: "Bu hafta sonu rezervasyon almaya başla", en: "Start taking bookings this weekend" },
    ctaSub: { tr: "Demo modda hemen dene; hazır olunca Stripe ve takvimini birkaç dakikada bağla.", en: "Try it in demo mode now; connect Stripe and your calendar in minutes when you're ready." },
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} />
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* copy */}
          <div className="stagger">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
              {t(m.badge)}
            </span>
            <h1 className="mt-5 max-w-xl font-display text-[40px] font-bold leading-[1.03] tracking-tight sm:text-[56px]">
              {t(m.heroTitle)}{" "}
              <span className="bg-gradient-to-r from-[oklch(70%_0.16_14)] to-[oklch(62%_0.17_350)] bg-clip-text text-transparent">
                {t(m.heroAccent)}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{t(m.heroSubtitle)}</p>

            <ul className="mt-7 space-y-2.5">
              {HERO_BENEFITS.map((b) => (
                <li key={t(b)} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/85">{t(b)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
              >
                {t(m.heroCtaSecondary)}
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {lang === "tr" ? "Kart gerekmez · demo modda anında çalışır" : "No card required · runs instantly in demo mode"}
            </p>
          </div>

          {/* floating product preview */}
          <div className="relative animate-float-up">
            <span className="blob absolute -right-8 -top-10 -z-10 h-56 w-56 bg-primary/25 drift" aria-hidden />
            <span className="blob absolute -bottom-10 -left-8 -z-10 h-48 w-48 drift" aria-hidden style={{ background: "color-mix(in oklch, var(--seg-2) 30%, transparent)" }} />
            <div className="absolute -left-5 top-10 hidden rotate-[-4deg] rounded-xl border border-border bg-card px-3 py-2 shadow-pop sm:block">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                <CalendarCheck className="h-3.5 w-3.5 text-success" />
                {lang === "tr" ? "Yeni rezervasyon" : "New booking"}
              </p>
              <p className="text-[10px] text-muted-foreground">Elif · 10:30</p>
            </div>
            <div className="absolute -right-4 bottom-8 hidden rotate-[5deg] rounded-xl border border-border bg-card px-3 py-2 shadow-pop sm:block">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                <BellRing className="h-3.5 w-3.5 text-primary" />
                {lang === "tr" ? "9 hatırlatma gönderildi" : "9 reminders sent"}
              </p>
            </div>
            <ProductPreview />
          </div>
        </div>

        {/* trusted-by */}
        <div className="border-y border-border bg-card/60">
          <div className="mx-auto max-w-6xl px-5 py-6">
            <p className="text-center label-mono text-muted-foreground">
              {lang === "tr" ? "Binlerce küçük işletme Booky ile rezervasyon alıyor" : "Thousands of small businesses take bookings on Booky"}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-90">
              {TRUSTED.map((c) => (
                <CompanyMark key={c} name={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive demo ──────────────────────────────────────── */}
      <section id="demo" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="label-mono text-primary">{lang === "tr" ? "Canlı demo" : "Live demo"}</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.demoTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.demoSub)}</p>
        </div>
        <div className="mt-10">
          <BookingDemo />
        </div>
      </section>

      {/* ── Stats band ────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden px-5 py-12 sm:grid-cols-4">
          {m.stats.map((s) => (
            <div key={s.value} className="px-4 text-center">
              <div className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{s.value}</div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">{t(s.label)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────── */}
      <section id="features" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.featuresTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.featuresSub)}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.map((f) => (
              <div key={t(f.title)} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-pop">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight">{t(f.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.useTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.useSub)}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <div key={t(u.title)} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <Icon name={u.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold tracking-tight">{t(u.title)}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t(u.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calendar showcase ─────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="label-mono text-primary">{t(SECTION.calEyebrow)}</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.calTitle)}</h2>
            <p className="mt-4 text-muted-foreground">{t(SECTION.calBody)}</p>
            <div className="mt-7 space-y-4">
              {CALENDAR_POINTS.map((c) => (
                <div key={t(c.title)} className="flex gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[15.5px] font-semibold tracking-tight">{t(c.title)}</h3>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{t(c.body)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* mini schedule mock (inline) */}
          <MiniSchedule lang={lang} />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.howTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.howSub)}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-bold text-primary/15">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight">{t(s.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
                {i < HOW_STEPS.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 place-items-center text-border lg:grid">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── No-show / deposits deep-dive ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="label-mono text-primary">{t(SECTION.deepEyebrow)}</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.deepTitle)}</h2>
            <p className="mt-4 text-muted-foreground">{t(SECTION.deepBody)}</p>
            <ul className="mt-6 space-y-3">
              {DEEP_DIVE_POINTS.map((p) => (
                <li key={t(p)} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/85">{t(p)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { v: "-38%", l: { tr: "gelmeyen", en: "no-shows" } as L },
                { v: "92%", l: { tr: "doluluk", en: "utilization" } as L },
                { v: "$0", l: { tr: "komisyon", en: "commission" } as L },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
                  <p className="font-display text-2xl font-bold tracking-tight">{s.v}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(s.l)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security/deposit cards */}
          <div className="space-y-4">
            {SECURITY.map((s) => (
              <div key={t(s.title)} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-semibold tracking-tight">{t(s.title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client experience ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="label-mono text-primary">{t(SECTION.cxEyebrow)}</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.cxTitle)}</h2>
            <p className="mt-4 text-muted-foreground">{t(SECTION.cxBody)}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {CX_POINTS.map((c) => (
                <div key={t(c.title)} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={c.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="mt-3 text-[14px] font-semibold">{t(c.title)}</h3>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{t(c.body)}</p>
                </div>
              ))}
            </div>
          </div>
          <PhoneMock lang={lang} />
        </div>
      </section>

      {/* ── Reminders timeline ────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="label-mono text-primary">{t(SECTION.remEyebrow)}</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.remTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.remSub)}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {REMINDER_TIMELINE.map((r, i) => (
              <div key={t(r.title)} className="relative">
                {/* connector */}
                {i < REMINDER_TIMELINE.length - 1 && (
                  <span className="absolute left-4 top-4 hidden h-px w-[calc(100%+1.5rem)] bg-border md:block" aria-hidden />
                )}
                <span className="relative grid h-8 w-8 place-items-center rounded-full ring-4 ring-background" style={{ background: r.tone }}>
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
                <p className="mt-4 label-mono text-muted-foreground">{t(r.when)}</p>
                <h3 className="mt-1 font-display text-[15.5px] font-semibold tracking-tight">{t(r.title)}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{t(r.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.compareTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.compareSub)}</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-left font-medium text-muted-foreground">{lang === "tr" ? "Özellik" : "Feature"}</th>
                    <th className="px-4 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Telefon / DM" : "Phone / DM"}</th>
                    <th className="px-4 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Jenerik araç" : "Generic tool"}</th>
                    <th className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 font-display text-[15px] font-bold tracking-tight text-primary">
                        {appConfig.name}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={t(row.feature)} className={cn("border-b border-border/60 last:border-0", i % 2 === 1 && "bg-muted/30")}>
                      <td className="px-5 py-3.5 font-medium">{t(row.feature)}</td>
                      <CompareCell value={row.phone} />
                      <CompareCell value={row.generic} />
                      <CompareCell value={row.booky} highlight />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.testTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.testSub)}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((tm) => (
            <figure key={tm.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Stars />
              <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-foreground/85">“{t(tm.quote)}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
                  {tm.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight">{tm.name}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{t(tm.role)}</p>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">{t(tm.metric)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.pricingTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.pricingSub)}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {m.pricing.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-7 shadow-soft",
                  tier.featured ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
              >
                {tier.featured && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    {t(SECTION.popular)}
                  </span>
                )}
                <h3 className="font-display text-lg font-bold tracking-tight">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(tier.tagline)}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground">{t(tier.period)}</span>}
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={t(f)} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2.5} />
                      <span className="text-foreground/85">{t(f)}</span>
                    </li>
                  ))}
                </ul>
                <CheckoutButton
                  planId={tier.name === "Pro" ? "pro" : tier.name === "İşletme" ? "isletme" : "solo"}
                  label={t(tier.cta)}
                  featured={tier.featured}
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {lang === "tr" ? "Tüm planlarda rezervasyon komisyonu %0. İstediğin zaman iptal et." : "0% booking commission on every plan. Cancel anytime."}
          </p>
        </div>
      </section>

      {/* ── Integrations ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.intTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.intSub)}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((it) => (
            <div key={it.name} className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/80">
                <Icon name={it.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold tracking-tight">{it.name}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{t(it.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Everything included ───────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.inclTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.inclSub)}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {INCLUDED.map((f) => (
              <div key={t(f)} className="flex items-center gap-2.5 text-[14.5px]">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-foreground/85">{t(f)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.faqTitle)}</h2>
        <div className="mt-10 divide-y divide-border">
          {m.faq.map((f) => (
            <details key={t(f.q)} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                <span>{t(f.q)}</span>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45">
                  <span className="text-lg leading-none">+</span>
                </span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t(f.a)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-pop" style={{ backgroundImage: "var(--grad-brand)" }}>
          <span className="blob absolute -right-10 -top-10 h-52 w-52 bg-white/20 drift" aria-hidden />
          <span className="blob absolute -bottom-12 -left-10 h-48 w-48 bg-black/10 drift" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.ctaTitle)}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">{t(SECTION.ctaSub)}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-foreground transition-opacity hover:opacity-90"
              >
                {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Link2 className="h-4 w-4" />
                {t(m.heroCtaSecondary)}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Comparison cell renderer ──────────────────────────────────────────────── */
function CompareCell({ value, highlight }: { value: boolean | L | string; highlight?: boolean }) {
  const { t } = useLang();
  let content: React.ReactNode;
  if (value === true) {
    content = (
      <span className={cn("inline-grid h-6 w-6 place-items-center rounded-full", highlight ? "bg-primary text-primary-foreground" : "bg-success/12 text-success")}>
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  } else if (value === false) {
    content = (
      <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground/50">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  } else {
    const text = typeof value === "string" ? value : t(value);
    content = <span className={cn("text-[12.5px] font-medium", highlight ? "text-primary" : "text-muted-foreground")}>{text}</span>;
  }
  return <td className={cn("px-4 py-3.5 text-center", highlight && "bg-primary/[0.03]")}>{content}</td>;
}

/* ── Mini staff-column schedule mock for the calendar showcase ──────────────── */
function MiniSchedule({ lang }: { lang: "tr" | "en" }) {
  const cols = [
    { who: "Selin", blocks: [{ top: 0, h: 2, c: "var(--svc-hair)", who: "Elif" }, { top: 3, h: 3, c: "var(--svc-color)", who: "Deniz" }] },
    { who: "Mert", blocks: [{ top: 1, h: 1, c: "var(--svc-hair)", who: "Burak" }, { top: 4, h: 1, c: "var(--svc-hair)", who: "Sıla" }] },
    { who: "Aylin", blocks: [{ top: 2, h: 2, c: "var(--svc-spa)", who: "Zeynep" }, { top: 5, h: 2, c: "var(--svc-nail)", who: "Naz" }] },
    { who: "Cem", blocks: [{ top: 0, h: 2, c: "var(--svc-train)", who: "Kerem" }] },
  ];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  const rowH = 30;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-pop">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="font-display text-sm font-semibold">{lang === "tr" ? "Bugün · 4 personel" : "Today · 4 staff"}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> {lang === "tr" ? "canlı" : "live"}
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: `40px repeat(4, 1fr)` }}>
        <div />
        {cols.map((c) => (
          <div key={c.who} className="px-1 pb-1 text-center text-[11px] font-semibold text-muted-foreground">{c.who}</div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: `40px repeat(4, 1fr)` }}>
        {/* time gutter */}
        <div className="relative" style={{ height: times.length * rowH }}>
          {times.map((tm, i) => (
            <span key={tm} className="absolute right-1.5 -translate-y-1/2 tnum text-[9px] text-muted-foreground" style={{ top: i * rowH }}>{tm}</span>
          ))}
        </div>
        {cols.map((c) => (
          <div key={c.who} className="relative border-l border-border/50" style={{ height: times.length * rowH }}>
            {times.map((_, i) => (
              <div key={i} className="absolute inset-x-0 border-t border-border/30" style={{ top: i * rowH, height: rowH }} />
            ))}
            {c.blocks.map((b, bi) => (
              <div
                key={bi}
                className="animate-pop absolute inset-x-0.5 overflow-hidden rounded-md border-l-[3px] px-1.5 py-1"
                style={{ top: b.top * rowH + 1, height: b.h * rowH - 2, background: `color-mix(in oklch, ${b.c} 14%, white)`, borderColor: b.c }}
              >
                <p className="truncate text-[10px] font-semibold" style={{ color: `color-mix(in oklch, ${b.c} 70%, black)` }}>{b.who}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Phone mock with an SMS confirmation, for the client-experience section ──── */
function PhoneMock({ lang }: { lang: "tr" | "en" }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <span className="blob absolute -right-6 top-6 -z-10 h-44 w-44 bg-primary/20 drift" aria-hidden />
      <div className="relative rounded-[2.2rem] border-[7px] border-foreground/85 bg-background shadow-pop">
        {/* notch */}
        <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground/85" />
        <div className="space-y-3 px-4 pb-6 pt-8">
          {/* header */}
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <span className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
              SL
            </span>
            <div>
              <p className="text-[12.5px] font-semibold leading-tight">Studio Lumière</p>
              <p className="text-[10px] text-muted-foreground">SMS · {lang === "tr" ? "şimdi" : "now"}</p>
            </div>
          </div>
          {/* confirmation bubble */}
          <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-[12.5px] leading-relaxed">
            <p className="font-semibold">
              {lang === "tr" ? "Randevun onaylandı ✅" : "You're booked ✅"}
            </p>
            <p className="mt-1 text-foreground/80">
              {lang === "tr"
                ? "Saç kesimi & şekillendirme · Selin ile · Cuma 10:30"
                : "Haircut & style · with Selin · Fri 10:30"}
            </p>
          </div>
          {/* deposit bubble */}
          <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-primary p-3 text-[12.5px] text-primary-foreground">
            {lang === "tr" ? "$10 depozito ödendi 💳" : "$10 deposit paid 💳"}
          </div>
          {/* actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <span className="rounded-lg border border-border bg-card py-2 text-center text-[11px] font-semibold">
              {lang === "tr" ? "Takvime ekle" : "Add to calendar"}
            </span>
            <span className="rounded-lg border border-border bg-card py-2 text-center text-[11px] font-semibold">
              {lang === "tr" ? "Yeniden planla" : "Reschedule"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
