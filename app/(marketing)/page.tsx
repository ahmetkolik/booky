"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  ShieldCheck,
  Zap,
  BellRing,
  CreditCard,
  Link2,
  Sparkles,
} from "lucide-react";
import appConfig from "@/app.config";
import { Icon } from "@/components/ui/icon";
import { BookingDemo } from "@/components/marketing/booking-demo";
import { CompanyMark, Stars } from "@/components/marketing/marks";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { SignalScene, SceneMotif } from "@/components/marketing/signal-scene";
import {
  Reveal,
  CountUp,
  TiltCard,
  Magnetic,
  useInView,
  useSectionProgress,
} from "@/components/marketing/motion";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { L } from "@/lib/i18n/config";
import { useState } from "react";

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
      {/* ── Hero — the Signal Scene: an empty day books itself full ── */}
      <SignalScene benefits={HERO_BENEFITS} />

      {/* trusted-by marquee */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <p className="text-center label-mono text-muted-foreground">
            {lang === "tr" ? "Binlerce küçük işletme Booky ile rezervasyon alıyor" : "Thousands of small businesses take bookings on Booky"}
          </p>
          <div className="marquee mt-5">
            <div className="marquee-track items-center gap-x-8 gap-y-4">
              {[...TRUSTED, ...TRUSTED].map((c, i) => (
                <span key={`${c}-${i}`} className="shrink-0 px-4">
                  <CompanyMark name={c} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive demo — parallax columns + spring revenue ───── */}
      <section id="demo" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="label-mono text-primary">{lang === "tr" ? "Canlı demo" : "Live demo"}</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.demoTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.demoSub)}</p>
        </Reveal>
        <Reveal className="mt-10" delay={120} y={34}>
          <BookingDemo />
        </Reveal>
      </section>

      {/* ── Stats band — odometer counters ──────────────────────────── */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden px-5 py-12 sm:grid-cols-4">
          {m.stats.map((s, i) => (
            <Reveal key={s.value} delay={i * 90} y={18} className="px-4 text-center">
              <div className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                <CountUp value={s.value} className="tnum" />
              </div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">{t(s.label)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features grid — pulled off the shelf, tilt + glow on hover ── */}
      <section id="features" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.featuresTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.featuresSub)}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.map((f, i) => (
              <Reveal key={t(f.title)} delay={(i % 3) * 90 + Math.floor(i / 3) * 60} y={36} rot={i % 2 === 0 ? -2 : 2} scale={0.97}>
                <TiltCard className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight">{t(f.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.useTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.useSub)}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u, i) => (
            <Reveal key={t(u.title)} delay={i * 100} y={32} rot={i % 2 === 0 ? 1.5 : -1.5} scale={0.97}>
              <TiltCard className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon name={u.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold tracking-tight">{t(u.title)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t(u.body)}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Calendar showcase — a schedule that runs itself ─────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Reveal>
              <span className="label-mono text-primary">{t(SECTION.calEyebrow)}</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.calTitle)}</h2>
              <p className="mt-4 text-muted-foreground">{t(SECTION.calBody)}</p>
            </Reveal>
            <div className="mt-7 space-y-4">
              {CALENDAR_POINTS.map((c, i) => (
                <Reveal key={t(c.title)} delay={150 + i * 110} x={-22} y={0}>
                  <div className="flex gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon name={c.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[15.5px] font-semibold tracking-tight">{t(c.title)}</h3>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{t(c.body)}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          {/* mini schedule — live now-line + a block that drags itself home */}
          <Reveal delay={120} y={30} scale={0.98}>
            <MiniSchedule lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* ── How it works — a painted rail, steps advancing ──────────── */}
      <HowItWorks title={t(SECTION.howTitle)} sub={t(SECTION.howSub)} />

      {/* ── No-show / deposits deep-dive — odometer stats ───────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <span className="label-mono text-primary">{t(SECTION.deepEyebrow)}</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.deepTitle)}</h2>
              <p className="mt-4 text-muted-foreground">{t(SECTION.deepBody)}</p>
            </Reveal>
            <ul className="mt-6 space-y-3">
              {DEEP_DIVE_POINTS.map((p, i) => (
                <Reveal key={t(p)} delay={100 + i * 80} x={-18} y={0}>
                  <li className="flex items-start gap-2.5 text-[15px]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/85">{t(p)}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { v: "-38%", l: { tr: "gelmeyen", en: "no-shows" } as L },
                { v: "92%", l: { tr: "doluluk", en: "utilization" } as L },
                { v: "$0", l: { tr: "komisyon", en: "commission" } as L },
              ].map((s, i) => (
                <Reveal key={s.v} delay={200 + i * 120} y={22} scale={0.94}>
                  <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
                    <p className="font-display text-2xl font-bold tracking-tight">
                      <CountUp value={s.v} className="tnum" duration={1600} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{t(s.l)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Security/deposit cards */}
          <div className="space-y-4">
            {SECURITY.map((s, i) => (
              <Reveal key={t(s.title)} delay={i * 130} x={26} y={0}>
                <TiltCard max={4} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[16px] font-semibold tracking-tight">{t(s.title)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client experience — SMS bubbles arriving on scroll ──────── */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <span className="label-mono text-primary">{t(SECTION.cxEyebrow)}</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.cxTitle)}</h2>
              <p className="mt-4 text-muted-foreground">{t(SECTION.cxBody)}</p>
            </Reveal>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {CX_POINTS.map((c, i) => (
                <Reveal key={t(c.title)} delay={120 + i * 100} y={24} scale={0.96}>
                  <TiltCard max={5} className="h-full rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={c.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <h3 className="mt-3 text-[14px] font-semibold">{t(c.title)}</h3>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{t(c.body)}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
          <PhoneMock lang={lang} />
        </div>
      </section>

      {/* ── Reminders timeline — a line painting itself down the page ── */}
      <ReminderTimeline
        eyebrow={t(SECTION.remEyebrow)}
        title={t(SECTION.remTitle)}
        sub={t(SECTION.remSub)}
      />

      {/* ── Comparison table — rows land one by one ─────────────────── */}
      <CompareTable title={t(SECTION.compareTitle)} sub={t(SECTION.compareSub)} lang={lang} />

      {/* ── Testimonials — a snap strip with depth, not a grid ──────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.testTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.testSub)}</p>
        </Reveal>
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
          {TESTIMONIALS.map((tm, i) => (
            <Reveal key={tm.name} delay={i * 70} y={22 + (i % 3) * 12} className="shrink-0 snap-center">
              <TiltCard
                max={4}
                className={cn(
                  "flex h-full w-[300px] flex-col rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[340px]",
                  i % 2 === 1 && "lg:translate-y-6",
                )}
              >
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
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing — the popular tier steps forward ────────────────── */}
      <section id="pricing" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.pricingTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.pricingSub)}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {m.pricing.map((tier, i) => (
              <Reveal key={tier.name} delay={tier.featured ? 220 : i * 110} y={30} scale={0.97}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border bg-card p-7 shadow-soft",
                    tier.featured ? "tier-featured relative z-10 border-primary ring-2 ring-primary/30" : "border-border",
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
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {lang === "tr" ? "Tüm planlarda rezervasyon komisyonu %0. İstediğin zaman iptal et." : "0% booking commission on every plan. Cancel anytime."}
          </p>
        </div>
      </section>

      {/* ── Integrations — staggered pop ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.intTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{t(SECTION.intSub)}</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((it, i) => (
            <Reveal key={it.name} delay={i * 100} y={16} scale={0.86}>
              <TiltCard max={5} className="flex h-full items-center gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/80">
                  <Icon name={it.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold tracking-tight">{it.name}</p>
                  <p className="truncate text-[12.5px] text-muted-foreground">{t(it.desc)}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Everything included — checks pop in ─────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.inclTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{t(SECTION.inclSub)}</p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {INCLUDED.map((f, i) => (
              <Reveal key={t(f)} delay={i * 45} y={12} x={-8}>
                <div className="flex items-center gap-2.5 text-[14.5px]">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/85">{t(f)}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — spring accordion ──────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.faqTitle)}</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-border">
          {m.faq.map((f, i) => (
            <Reveal key={t(f.q)} delay={i * 50} y={14}>
              <FaqRow q={t(f.q)} a={t(f.a)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA — the Signal Scene echoes back, fully booked ────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal y={40} scale={0.98}>
          <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-pop" style={{ backgroundImage: "var(--grad-brand)" }}>
            <span className="blob absolute -right-10 -top-10 h-52 w-52 bg-white/20 drift" aria-hidden />
            <span className="blob absolute -bottom-12 -left-10 h-48 w-48 bg-black/10 drift" aria-hidden />
            {/* the day motif — full, closing the loop opened by the hero */}
            <SceneMotif className="pointer-events-none absolute -left-6 top-1/2 hidden w-64 -translate-y-1/2 opacity-40 lg:block" />
            <SceneMotif className="pointer-events-none absolute -right-6 top-1/2 hidden w-64 -translate-y-1/2 -scale-x-100 opacity-40 lg:block" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t(SECTION.ctaTitle)}</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">{t(SECTION.ctaSub)}</p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic>
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-foreground transition-opacity hover:opacity-90"
                  >
                    {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <a
                    href="#demo"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Link2 className="h-4 w-4" />
                    {t(m.heroCtaSecondary)}
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ── How it works — big mono step numbers on a painted progress rail ────────── */
function HowItWorks({ title, sub }: { title: string; sub: string }) {
  const { t } = useLang();
  const { ref, stage } = useSectionProgress<HTMLDivElement>(HOW_STEPS.length, 0.78);

  return (
    <section id="how" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground">{sub}</p>
        </Reveal>

        <div ref={ref} className="relative mt-12">
          {/* the rail — paints with scroll progress (--sp set by the hook) */}
          <div className="absolute -top-4 left-0 right-0 hidden h-px bg-border lg:block" aria-hidden>
            <div className="paint-x h-full w-full" style={{ background: "var(--grad-brand)" }} />
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => {
              const state = i < stage - 1 ? "past" : i === stage - 1 ? "active" : "waiting";
              return (
                <div
                  key={s.n}
                  className={cn(
                    "relative rounded-2xl border bg-card p-6 shadow-soft transition-all duration-700 [transition-timing-function:var(--ease-out)]",
                    state === "waiting" && "translate-y-4 border-border opacity-30",
                    state === "active" && "translate-y-0 border-primary/40 opacity-100 shadow-pop ring-1 ring-primary/20",
                    state === "past" && "translate-y-0 border-border opacity-60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-xl transition-colors duration-500",
                        state === "active" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        "font-mono text-4xl font-bold tracking-tight transition-colors duration-500",
                        state === "active" ? "text-primary/70" : "text-primary/15",
                      )}
                    >
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight">{t(s.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Reminders — a vertical line paints down; steps light up in their tone ──── */
function ReminderTimeline({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  const { t } = useLang();
  const { ref, stage } = useSectionProgress<HTMLDivElement>(REMINDER_TIMELINE.length, 0.72);

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="label-mono text-primary">{eyebrow}</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground">{sub}</p>
        </Reveal>

        <div ref={ref} className="relative mx-auto mt-14 max-w-2xl">
          {/* the spine + its painted overlay */}
          <span className="absolute bottom-3 left-4 top-1 w-px bg-border" aria-hidden />
          <span className="paint-y absolute bottom-3 left-4 top-1 w-[2px]" style={{ background: "var(--grad-brand)" }} aria-hidden />

          <div className="space-y-10">
            {REMINDER_TIMELINE.map((r, i) => {
              const on = i < stage;
              return (
                <div key={t(r.title)} className="relative pl-14">
                  <span
                    className="absolute left-4 top-1 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full ring-4 ring-background transition-all duration-500 [transition-timing-function:var(--ease-spring)]"
                    style={{ background: on ? r.tone : "var(--color-border)", transform: `translateX(-50%) scale(${on ? 1 : 0.7})` }}
                  >
                    <span className={cn("h-2 w-2 rounded-full bg-white transition-opacity duration-300", !on && "opacity-40")} />
                  </span>
                  <div className={cn("transition-all duration-500", on ? "opacity-100" : "translate-y-2 opacity-35")}>
                    <p className="label-mono" style={{ color: on ? r.tone : "var(--color-muted-foreground)" }}>{t(r.when)}</p>
                    <h3 className="mt-1 font-display text-[16.5px] font-semibold tracking-tight">{t(r.title)}</h3>
                    <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">{t(r.body)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Comparison table — rows land in sequence, Booky checks glow coral ──────── */
function CompareTable({ title, sub, lang }: { title: string; sub: string; lang: "tr" | "en" }) {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground">{sub}</p>
        </Reveal>
        <div ref={ref} className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
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
                  <tr
                    key={t(row.feature)}
                    className={cn(
                      "border-b border-border/60 transition-all duration-500 [transition-timing-function:var(--ease-out)] last:border-0",
                      i % 2 === 1 && "bg-muted/30",
                      inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                    )}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <td className="px-5 py-3.5 font-medium">{t(row.feature)}</td>
                    <CompareCell value={row.phone} />
                    <CompareCell value={row.generic} />
                    <CompareCell value={row.booky} highlight glow={inView} glowDelay={i * 80 + 300} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Comparison cell renderer ──────────────────────────────────────────────── */
function CompareCell({
  value,
  highlight,
  glow,
  glowDelay = 0,
}: {
  value: boolean | L | string;
  highlight?: boolean;
  glow?: boolean;
  glowDelay?: number;
}) {
  const { t } = useLang();
  let content: React.ReactNode;
  if (value === true) {
    content = (
      <span
        className={cn(
          "inline-grid h-6 w-6 place-items-center rounded-full",
          highlight ? "bg-primary text-primary-foreground" : "bg-success/12 text-success",
          highlight && glow && "glow-check",
        )}
        style={highlight && glow ? { animationDelay: `${glowDelay}ms` } : undefined}
      >
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

/* ── FAQ row — spring-eased accordion (grid-rows trick, no layout jank) ─────── */
function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-medium"
      >
        <span>{q}</span>
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform duration-500 [transition-timing-function:var(--ease-spring)]",
            open && "rotate-45 border-primary/40 text-primary",
          )}
        >
          <span className="text-lg leading-none">+</span>
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:var(--ease-spring)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <p className="pt-2.5 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Mini staff-column schedule mock — now with a self-gliding "now" line and
   a booking block that drags itself into an open slot when scrolled into view. */
function MiniSchedule({ lang }: { lang: "tr" | "en" }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const cols = [
    { who: "Selin", blocks: [{ top: 0, h: 2, c: "var(--svc-hair)", who: "Elif" }, { top: 3, h: 3, c: "var(--svc-color)", who: "Deniz" }] },
    { who: "Mert", blocks: [{ top: 1, h: 1, c: "var(--svc-hair)", who: "Burak" }, { top: 4, h: 1, c: "var(--svc-hair)", who: "Sıla" }] },
    { who: "Aylin", blocks: [{ top: 2, h: 2, c: "var(--svc-spa)", who: "Zeynep" }, { top: 5, h: 2, c: "var(--svc-nail)", who: "Naz" }] },
    { who: "Cem", blocks: [{ top: 0, h: 2, c: "var(--svc-train)", who: "Kerem" }] },
  ];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  const rowH = 30;

  return (
    <TiltCard max={4} className="rounded-2xl border border-border bg-card p-4 shadow-pop">
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
      <div ref={ref} className="relative">
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

        {/* a rescheduled booking dragging itself into Cem's open 11:00 slot */}
        <div
          className={cn("drag-demo absolute z-10 overflow-hidden rounded-md border-l-[3px] px-1.5 py-1", inView && "is-in")}
          style={{ height: rowH - 2, background: "color-mix(in oklch, var(--svc-color) 14%, white)", borderColor: "var(--svc-color)" }}
          aria-hidden
        >
          <p className="truncate text-[10px] font-semibold" style={{ color: "color-mix(in oklch, var(--svc-color) 70%, black)" }}>Defne</p>
        </div>

        {/* the "now" line, sweeping the day on its own */}
        <div className="now-sweep pointer-events-none absolute inset-x-0 z-10" aria-hidden>
          <div className="relative ml-10 border-t-[1.5px] border-primary/70">
            <span className="absolute -left-1 -top-[4.5px] h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* ── Phone mock — the SMS confirmation arrives bubble by bubble on scroll ───── */
function PhoneMock({ lang }: { lang: "tr" | "en" }) {
  return (
    <Reveal y={34} scale={0.97} className="relative mx-auto w-full max-w-[300px]">
      <span className="blob absolute -right-6 top-6 -z-10 h-44 w-44 bg-primary/20 drift" aria-hidden />
      <TiltCard max={5} className="relative rounded-[2.2rem] border-[7px] border-foreground/85 bg-background shadow-pop">
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
          {/* confirmation bubble — slides in like a fresh SMS */}
          <Reveal x={-26} y={0} delay={350} duration={600}>
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
          </Reveal>
          {/* deposit bubble */}
          <Reveal x={26} y={0} delay={750} duration={600}>
            <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-primary p-3 text-[12.5px] text-primary-foreground">
              {lang === "tr" ? "$10 depozito ödendi 💳" : "$10 deposit paid 💳"}
            </div>
          </Reveal>
          {/* actions */}
          <Reveal y={12} delay={1100} duration={600}>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <span className="rounded-lg border border-border bg-card py-2 text-center text-[11px] font-semibold">
                {lang === "tr" ? "Takvime ekle" : "Add to calendar"}
              </span>
              <span className="rounded-lg border border-border bg-card py-2 text-center text-[11px] font-semibold">
                {lang === "tr" ? "Yeniden planla" : "Reschedule"}
              </span>
            </div>
          </Reveal>
        </div>
      </TiltCard>
    </Reveal>
  );
}
