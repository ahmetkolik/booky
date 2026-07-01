/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  app.config.ts — the single source of truth for this starter.            │
 * │                                                                          │
 * │  Booky: online appointment booking for service businesses (salons,       │
 * │  barbers, spas, trainers, clinics). Inspired by vagaro.com / mindbody.io.│
 * │                                                                          │
 * │  Every user-facing string is bilingual: { tr: "...", en: "..." }.        │
 * │  The guided setup (run `/setup`, or say "bu projeyi kur") edits this      │
 * │  file plus app/globals.css and .env.local.                               │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import type { L } from "@/lib/i18n/config";

export type IconName = string;

export interface NavItem {
  label: L;
  href: string;
  icon: IconName;
  badge?: L;
  /** "Coming soon" items render non-navigating and dimmed. */
  muted?: boolean;
}

export interface NavGroup {
  label: L;
  items: NavItem[];
}

export interface Feature {
  icon: IconName;
  title: L;
  body: L;
}

export interface Stat {
  value: string;
  label: L;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: L;
  tagline: L;
  features: L[];
  cta: L;
  featured?: boolean;
}

export interface FaqItem {
  q: L;
  a: L;
}

export interface Integration {
  key: string;
  name: string;
  envVars: string[];
  required: boolean;
  docsUrl: string;
  purpose: string;
}

export interface AppConfig {
  name: string;
  tagline: L;
  description: L;
  domain: string;
  logoText: string;
  accentName: string;
  marketing: {
    badge: L;
    heroTitle: L;
    heroAccent: L;
    heroSubtitle: L;
    heroCtaPrimary: L;
    heroCtaSecondary: L;
    features: Feature[];
    stats: Stat[];
    pricing: PricingTier[];
    faq: FaqItem[];
  };
  /** Flat list — used by the topbar to resolve the current page title. */
  nav: NavItem[];
  /** Grouped list — drives the sidebar. */
  navGroups: NavGroup[];
  integrations: Integration[];
}

export const appConfig: AppConfig = {
  name: "Booky",
  tagline: { tr: "Müşterilerin seni 7/24 rezerve etsin.", en: "Let clients book you 24/7." },
  description: {
    tr: "Salonlar, berberler, spa'lar, antrenörler ve klinikler için online randevu sistemi. Bir rezervasyon sayfası, takvim, personel, ödemeler ve hatırlatmalar — kutudan çıktığı gibi.",
    en: "Online appointment booking for service businesses — salons, barbers, spas, trainers, clinics. A booking page, calendar, staff, payments and reminders, right out of the box.",
  },
  domain: "booky.app",
  logoText: "BKY",
  accentName: "coral",

  marketing: {
    badge: { tr: "Randevu, otomatik", en: "Bookings, on autopilot" },
    heroTitle: {
      tr: "Müşterilerin seni",
      en: "Let clients book you",
    },
    heroAccent: {
      tr: "7/24 rezerve etsin.",
      en: "24/7.",
    },
    heroSubtitle: {
      tr: "Booky size paylaşılabilir bir rezervasyon sayfası, akıllı bir takvim, personel yönetimi, depozitolu ödemeler ve otomatik hatırlatmalar verir — telefon trafiğine ve gelmeyen müşterilere son.",
      en: "Booky gives you a shareable booking page, a smart calendar, staff management, deposit payments and automatic reminders — no more phone tag or no-shows.",
    },
    heroCtaPrimary: { tr: "Ücretsiz başla", en: "Start free" },
    heroCtaSecondary: { tr: "Canlı demoyu gör", en: "See the live demo" },
    features: [
      { icon: "globe", title: { tr: "Online rezervasyon sayfası", en: "Online booking page" }, body: { tr: "Markalı, paylaşılabilir bir sayfa. Müşteriler hizmeti, personeli ve saati seçer — sen uyurken bile.", en: "A branded, shareable page. Clients pick a service, a staff member and a time — even while you sleep." } },
      { icon: "calendar-days", title: { tr: "Akıllı takvim", en: "Smart calendar" }, body: { tr: "Personel sütunları, mola payları, çakışma koruması ve Google/Apple takvim senkronu.", en: "Staff columns, buffer times, double-booking protection and Google/Apple calendar sync." } },
      { icon: "users", title: { tr: "Personel yönetimi", en: "Staff management" }, body: { tr: "Her personelin kendi hizmetleri, çalışma saatleri ve doluluk oranı. İzinleri tek tıkla blokla.", en: "Each member gets their own services, hours and utilization. Block time off in one click." } },
      { icon: "credit-card", title: { tr: "Ödeme & depozito", en: "Payments & deposits" }, body: { tr: "Stripe ile rezervasyonda depozito al, gelmeyen müşteriden ücreti otomatik tahsil et.", en: "Take a deposit at booking with Stripe, and auto-charge a no-show fee when they don't show." } },
      { icon: "bell-ring", title: { tr: "Otomatik hatırlatmalar", en: "Automatic reminders" }, body: { tr: "SMS ve e-posta hatırlatmaları gelmeyen oranını düşürür. Tek tıkla yeniden rezervasyon.", en: "SMS and email reminders cut no-shows. One-tap rebooking links bring clients back." } },
      { icon: "contact", title: { tr: "Müşteri kayıtları", en: "Client records" }, body: { tr: "Ziyaret geçmişi, notlar, harcama ve tercihler — her müşteri için tek bir kart.", en: "Visit history, notes, spend and preferences — one card per client, always at hand." } },
    ],
    stats: [
      { value: "24/7", label: { tr: "online rezervasyon", en: "online booking" } },
      { value: "-38%", label: { tr: "gelmeyen oranı", en: "fewer no-shows" } },
      { value: "5 dk", label: { tr: "kurulum süresi", en: "to set up" } },
      { value: "%0", label: { tr: "rezervasyon komisyonu", en: "booking commission" } },
    ],
    pricing: [
      {
        name: "Solo",
        price: "Ücretsiz",
        tagline: { tr: "Tek kişilik işletmeler için.", en: "For solo practitioners." },
        features: [
          { tr: "1 personel", en: "1 staff member" },
          { tr: "Online rezervasyon sayfası", en: "Online booking page" },
          { tr: "Takvim & e-posta hatırlatmaları", en: "Calendar & email reminders" },
          { tr: "Ayda 50 rezervasyon", en: "50 bookings / month" },
          { tr: "Temel gelir özeti", en: "Basic revenue summary" },
        ],
        cta: { tr: "Ücretsiz başla", en: "Start free" },
      },
      {
        name: "Pro",
        price: "₺899",
        period: { tr: "/ay", en: "/mo" },
        tagline: { tr: "Büyüyen ekipler için.", en: "For growing teams." },
        features: [
          { tr: "5 personele kadar", en: "Up to 5 staff" },
          { tr: "Depozito & no-show ücreti", en: "Deposits & no-show fees" },
          { tr: "SMS hatırlatmaları", en: "SMS reminders" },
          { tr: "Sınırsız rezervasyon", en: "Unlimited bookings" },
          { tr: "Google Takvim senkronu", en: "Google Calendar sync" },
          { tr: "Temel gelir & kaynak raporu", en: "Basic revenue & source report" },
        ],
        cta: { tr: "7 gün ücretsiz dene", en: "Start 7-day trial" },
        featured: true,
      },
      {
        name: "İşletme",
        price: "₺1.799",
        period: { tr: "/ay", en: "/mo" },
        tagline: { tr: "Çok şubeli işletmeler için.", en: "For multi-location businesses." },
        features: [
          { tr: "Sınırsız personel & şube", en: "Unlimited staff & locations" },
          { tr: "Pro'daki tüm özellikler", en: "Everything in Pro" },
          { tr: "Detaylı gelir tablosu & Excel/CSV export", en: "Detailed revenue table & Excel/CSV export" },
          { tr: "Hizmet bazlı karlılık raporu", en: "Per-service profitability report" },
          { tr: "Çoklu şube karşılaştırma raporu", en: "Multi-location comparison report" },
          { tr: "Roller & yetki yönetimi", en: "Roles & permissions" },
{ tr: "Öncelikli destek (4s yanıt süresi)", en: "Priority support (4h response)" },
          { tr: "Özel onboarding & eğitim", en: "Dedicated onboarding & training" },
        ],
        cta: { tr: "Bizimle iletişime geç", en: "Contact us" },
      },
    ],
    faq: [
      { q: { tr: "Denemek için kart veya API anahtarı gerekli mi?", en: "Do I need a card or any keys to try it?" }, a: { tr: "Hayır. Booky gerçekçi örnek randevularla demo modda açılır — hemen tıklayabilirsin.", en: "No. Booky boots in demo mode with realistic sample appointments — click around immediately." } },
      { q: { tr: "Müşteriler nasıl rezervasyon yapar?", en: "How do clients book?" }, a: { tr: "Paylaşılabilir rezervasyon sayfanın bağlantısını verirsin; müşteri hizmeti, personeli ve uygun saati seçer. Uygulama indirmeye gerek yok.", en: "You share your booking page link; the client picks a service, a staff member and an open time. No app to install." } },
      { q: { tr: "Gelmeyen müşterileri nasıl azaltır?", en: "How does it reduce no-shows?" }, a: { tr: "Otomatik SMS/e-posta hatırlatmaları gönderir ve istersen rezervasyonda depozito alır; gelmeyen müşteriden ücret otomatik tahsil edilebilir.", en: "It sends automatic SMS/email reminders and can require a deposit at booking; a no-show fee can be charged automatically." } },
      { q: { tr: "Takvimime bağlanır mı?", en: "Does it sync with my calendar?" }, a: { tr: "Evet — Google ve Apple Takvim ile çift yönlü senkron kurulumda bağlanır.", en: "Yes — two-way Google and Apple Calendar sync connects during setup." } },
      { q: { tr: "Ödemeleri kim işler?", en: "Who processes payments?" }, a: { tr: "Stripe. Depozitolar ve ödemeler doğrudan kendi Stripe hesabına gelir; Booky araya komisyon koymaz.", en: "Stripe. Deposits and payments land in your own Stripe account; Booky takes no booking commission." } },
      { q: { tr: "Birden fazla personelim var, çalışır mı?", en: "I have several staff — does it work?" }, a: { tr: "Evet. Her personel kendi sütununda, kendi hizmetleri ve çalışma saatleriyle görünür.", en: "Yes. Each staff member appears in their own column with their own services and working hours." } },
      { q: { tr: "Teknoloji nedir?", en: "What's the stack?" }, a: { tr: "Next.js 16 (App Router), React 19, Tailwind v4. Vendor kilidi yok.", en: "Next.js 16 (App Router), React 19, Tailwind v4. No vendor lock-in." } },
      { q: { tr: "Yayına alabilir miyim?", en: "Can I deploy it?" }, a: { tr: "Evet — standart bir Next.js uygulaması. Vercel'e veya herhangi bir Node sunucusuna gönder.", en: "Yes — it's a standard Next.js app. Push to Vercel or any Node host." } },
    ],
  },

  nav: [
    { label: { tr: "Panel", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
    { label: { tr: "Takvim", en: "Calendar" }, href: "/calendar", icon: "calendar-days" },
    { label: { tr: "Müşteriler", en: "Clients" }, href: "/clients", icon: "users" },
    { label: { tr: "Ayarlar", en: "Settings" }, href: "/settings", icon: "settings" },
  ],

  navGroups: [
    {
      label: { tr: "İşletme", en: "Workspace" },
      items: [
        { label: { tr: "Panel", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
        { label: { tr: "Takvim", en: "Calendar" }, href: "/calendar", icon: "calendar-days" },
        { label: { tr: "Müşteriler", en: "Clients" }, href: "/clients", icon: "users" },
      ],
    },
    {
      label: { tr: "Kurulum", en: "Setup" },
      items: [
        { label: { tr: "Hizmetler", en: "Services" }, href: "/services", icon: "scissors" },
        { label: { tr: "Personel", en: "Staff" }, href: "/staff", icon: "user-cog" },
        { label: { tr: "Rezervasyon sayfası", en: "Booking page" }, href: "/booking", icon: "globe" },
      ],
    },
  ],

  integrations: [
    {
      key: "supabase",
      name: "Supabase",
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      required: false,
      docsUrl: "https://supabase.com/dashboard/project/_/settings/api",
      purpose: "Database & auth — clients, appointments, staff. Without it, the app runs in demo mode.",
    },
    {
      key: "stripe",
      name: "Stripe",
      envVars: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
      required: false,
      docsUrl: "https://dashboard.stripe.com/apikeys",
      purpose: "Deposits & payments — take a deposit at booking and charge no-show fees.",
    },
    {
      key: "calendar",
      name: "Google Calendar",
      envVars: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET"],
      required: false,
      docsUrl: "https://console.cloud.google.com/apis/credentials",
      purpose: "Two-way calendar sync — keep staff availability in step with their personal calendars.",
    },
    {
      key: "twilio",
      name: "Twilio",
      envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
      required: false,
      docsUrl: "https://console.twilio.com",
      purpose: "SMS reminders — send appointment reminders and rebooking links to cut no-shows.",
    },
  ],
};

export default appConfig;
