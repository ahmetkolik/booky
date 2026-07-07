"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Check,
  CalendarCheck,
  CreditCard,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import { cn, formatPrice, formatDuration, minutesToHHMM } from "@/lib/utils";
import {
  bookingPage,
  staff,
  serviceById,
  SERVICE_VAR,
} from "@/lib/demo/data";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/i18n/language-provider";

/* ── Types ───────────────────────────────────────────────────── */
type Step = "service" | "staff" | "datetime" | "confirm" | "done";

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEK_DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDemoWeek() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

/* ── Step indicator ──────────────────────────────────────────── */
function Steps({ current }: { current: Step }) {
  const { lang } = useLang();
  const steps: { key: Step; label: string }[] = [
    { key: "service", label: lang === "tr" ? "Hizmet" : "Service" },
    { key: "staff", label: lang === "tr" ? "Personel" : "Staff" },
    { key: "datetime", label: lang === "tr" ? "Tarih & Saat" : "Date & Time" },
    { key: "confirm", label: lang === "tr" ? "Onayla" : "Confirm" },
  ];
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
            i < idx ? "bg-success text-white" : i === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {i < idx ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
          </div>
          <span className={cn("hidden text-[11px] sm:inline", i === idx ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="mx-1 h-px w-4 bg-border sm:w-6" />}
        </div>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function BookingPage() {
  const { t, lang } = useLang();

  /* In demo mode every slug shows the same business. With Supabase this becomes a DB lookup. */
  const business = bookingPage;
  const offeredServices = business.options.map((id) => serviceById(id));
  const availableStaff = staff.filter((s) => s.online);
  const week = getDemoWeek();

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState(offeredServices[0].id);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);

  const svc = serviceById(selectedService);
  const stf = selectedStaff ? staff.find((s) => s.id === selectedStaff) : null;

  function next() {
    if (step === "service") setStep("staff");
    else if (step === "staff") setStep("datetime");
    else if (step === "datetime") setStep("confirm");
    else if (step === "confirm") setStep("done");
  }
  function back() {
    if (step === "staff") setStep("service");
    else if (step === "datetime") setStep("staff");
    else if (step === "confirm") setStep("datetime");
  }

  const canNext =
    (step === "service") ||
    (step === "staff" && selectedStaff !== null) ||
    (step === "datetime" && selectedSlot !== null) ||
    (step === "confirm" && name.trim().length > 1 && phone.trim().length > 7);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
              SL
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold leading-tight">{business.business}</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span>{business.rating}</span>
                <span>({business.reviews})</span>
              </div>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center px-4 py-6">
        <div className="w-full max-w-lg space-y-6">

          {step !== "done" && (
            <div className="flex items-center justify-between">
              <Steps current={step} />
              {step !== "service" && (
                <button onClick={back} className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                  {lang === "tr" ? "Geri" : "Back"}
                </button>
              )}
            </div>
          )}

          {/* ── Step 1: Service ─────────────────────────────── */}
          {step === "service" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold">
                {lang === "tr" ? "Hizmet seçin" : "Choose a service"}
              </h2>
              <div className="space-y-2">
                {offeredServices.map((sv) => {
                  const sel = sv.id === selectedService;
                  return (
                    <button
                      key={sv.id}
                      onClick={() => setSelectedService(sv.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                        sel ? "border-primary/50 bg-primary/[0.04] shadow-sm" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ background: SERVICE_VAR[sv.color] }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold leading-tight">{t(sv.name)}</p>
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDuration(sv.durationMin)}</span>
                          {sv.deposit > 0 && (
                            <>
                              <span>·</span>
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>{formatPrice(sv.deposit)} {lang === "tr" ? "depozito" : "deposit"}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="tnum font-bold">{formatPrice(sv.price)}</p>
                        {sel && (
                          <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground ml-auto">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Staff ───────────────────────────────── */}
          {step === "staff" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold">
                {lang === "tr" ? "Personel seçin" : "Choose a staff member"}
              </h2>
              <button
                onClick={() => setSelectedStaff("any")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  selectedStaff === "any" ? "border-primary/50 bg-primary/[0.04]" : "border-border hover:bg-muted/50",
                )}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-lg">🎲</span>
                <div className="flex-1">
                  <p className="font-semibold">{lang === "tr" ? "Fark etmez" : "No preference"}</p>
                  <p className="text-[12px] text-muted-foreground">{lang === "tr" ? "İlk uygun personel" : "First available"}</p>
                </div>
                {selectedStaff === "any" && <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />}
              </button>
              {availableStaff.map((s) => {
                const sel = selectedStaff === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                      sel ? "border-primary/50 bg-primary/[0.04]" : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
                      {s.initials}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-card" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{s.name}</p>
                      <p className="text-[12px] text-muted-foreground">{t(s.role)}</p>
                    </div>
                    {sel && <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Step 3: Date & Time ─────────────────────────── */}
          {step === "datetime" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">
                {lang === "tr" ? "Tarih ve saat seçin" : "Choose date & time"}
              </h2>

              {/* Day strip */}
              <div className="grid grid-cols-7 gap-1">
                {week.map((d, i) => {
                  const dayNames = lang === "tr" ? WEEK_DAYS : WEEK_DAYS_EN;
                  const sel = selectedDay === i;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                      className={cn(
                        "flex flex-col items-center rounded-xl border py-2.5 text-center transition-all",
                        sel ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="text-[10px] font-medium opacity-70">{dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]}</span>
                      <span className="tnum text-[15px] font-bold leading-tight">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              <div>
                <p className="label-mono mb-2 text-muted-foreground">
                  {lang === "tr" ? "Müsait saatler" : "Available times"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[...business.slots, ...business.bookedSlots].sort((a, b) => a - b).map((min) => {
                    const booked = business.bookedSlots.includes(min);
                    const sel = selectedSlot === min;
                    return (
                      <button
                        key={min}
                        disabled={booked}
                        aria-disabled={booked}
                        onClick={() => setSelectedSlot(min)}
                        className={cn(
                          "tnum rounded-xl border py-2.5 text-center text-[13px] font-medium transition-all",
                          booked
                            ? "cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground/50 line-through"
                            : sel ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border hover:border-primary/50",
                        )}
                      >
                        {minutesToHHMM(min)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {lang === "tr" ? "Üstü çizili saatler dolu." : "Struck-through times are already booked."}
                </p>
              </div>

              {svc.deposit > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3 text-[12.5px] text-muted-foreground">
                    <CreditCard className="h-4 w-4 shrink-0 text-primary" />
                    {lang === "tr"
                      ? `Rezervasyonu onaylamak için ${formatPrice(svc.deposit)} depozito alınacak.`
                      : `A ${formatPrice(svc.deposit)} deposit is required to confirm your booking.`}
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[12px] text-destructive/80">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>
                      {lang === "tr"
                        ? "Randevunuzu iptal etmemeniz veya gelmemeniz durumunda depozito iade edilmez. İptal için en az 24 saat öncesinde bildirim gereklidir."
                        : "The deposit is non-refundable for no-shows or late cancellations. Cancellations must be made at least 24 hours in advance."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Confirm ─────────────────────────────── */}
          {step === "confirm" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">
                {lang === "tr" ? "Bilgilerinizi girin" : "Enter your details"}
              </h2>

              {/* Summary card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: SERVICE_VAR[svc.color] }} />
                  <span className="font-semibold">{t(svc.name)}</span>
                  <span className="tnum ml-auto font-bold">{formatPrice(svc.price)}</span>
                </div>
                {stf && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>{stf.name}</span>
                  </div>
                )}
                {selectedSlot !== null && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {week[selectedDay].toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "long" })}
                      {" · "}{minutesToHHMM(selectedSlot)}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {business.address}
                    {" · "}
                    <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {lang === "tr" ? "Yol tarifi" : "Directions"}
                    </a>
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="label-mono text-muted-foreground">{lang === "tr" ? "Ad Soyad" : "Full name"}</label>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === "tr" ? "Adınız Soyadınız" : "Your full name"}
                      className="flex-1 bg-transparent text-[14px] placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-mono text-muted-foreground">{lang === "tr" ? "Telefon" : "Phone"}</label>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 5xx xxx xx xx"
                      type="tel"
                      className="flex-1 bg-transparent text-[14px] placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-mono text-muted-foreground">{lang === "tr" ? "Not (opsiyonel)" : "Note (optional)"}</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={lang === "tr" ? "Özel istek veya not..." : "Special requests or notes..."}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* İYS SMS consent */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
                  <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-border bg-card transition-colors"
                    style={smsConsent ? { background: "var(--primary)", borderColor: "var(--primary)" } : {}}>
                    {smsConsent && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </span>
                  <span className="text-[12.5px] leading-snug text-muted-foreground">
                    {lang === "tr"
                      ? "SMS hatırlatmaları almak istiyorum (6563 sayılı Kanun — İYS kapsamında açık rızamı veriyorum)."
                      : "I'd like to receive SMS reminders (İYS opt-in consent under Turkish e-Commerce Law)."}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ── Done ────────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-success/10">
                <CalendarCheck className="h-10 w-10 text-success" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {lang === "tr" ? "Randevunuz alındı!" : "Booking confirmed!"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {lang === "tr"
                    ? `${name}, SMS ve e-posta ile onay gönderildi.`
                    : `${name}, a confirmation was sent via SMS and email.`}
                </p>
              </div>

              {/* Summary */}
              <div className="w-full rounded-2xl border border-border bg-card p-5 text-left space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{lang === "tr" ? "Hizmet" : "Service"}</span>
                  <span className="font-semibold">{t(svc.name)}</span>
                </div>
                {stf && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === "tr" ? "Personel" : "Staff"}</span>
                    <span className="font-semibold">{stf.name}</span>
                  </div>
                )}
                {selectedSlot !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === "tr" ? "Tarih & Saat" : "Date & Time"}</span>
                    <span className="tnum font-semibold">
                      {week[selectedDay].toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { day: "numeric", month: "long" })}
                      {" "}{minutesToHHMM(selectedSlot)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">{lang === "tr" ? "Adres" : "Address"}</span>
                  <span className="text-right font-semibold">{business.address}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted-foreground">{lang === "tr" ? "Toplam" : "Total"}</span>
                  <span className="tnum text-[15px] font-bold">{formatPrice(svc.price)}</span>
                </div>
              </div>

              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-[13.5px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
              >
                <MapPin className="h-4 w-4 text-primary" />
                {lang === "tr" ? "Yol tarifi al (Google Maps)" : "Get directions (Google Maps)"}
              </a>

              {smsConsent && (
                <p className="text-[12px] text-muted-foreground">
                  {lang === "tr"
                    ? "Randevunuzdan 24 saat önce hatırlatma, 2 saat önce yol tarifiyle son bir SMS gönderilecek."
                    : "You'll get a reminder 24h before, and a final SMS with directions 2h before your appointment."}
                </p>
              )}

              <button
                onClick={() => { setStep("service"); setSelectedSlot(null); setName(""); setPhone(""); setNote(""); setSmsConsent(false); }}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                {lang === "tr" ? "Yeni randevu al" : "Book another appointment"}
              </button>
            </div>
          )}

          {/* ── CTA Button ──────────────────────────────────── */}
          {step !== "done" && (
            <button
              onClick={next}
              disabled={!canNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {step === "confirm" ? (
                <>
                  <CalendarCheck className="h-5 w-5" />
                  {lang === "tr" ? "Randevuyu onayla" : "Confirm booking"}
                </>
              ) : (
                <>
                  {lang === "tr" ? "Devam et" : "Continue"}
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border py-4 text-center text-[11px] text-muted-foreground">
        {business.business} · {lang === "tr" ? "Bu sayfa" : "Powered by"}{" "}
        <span className="font-semibold text-foreground">Booky</span>{" "}
        {lang === "tr" ? "ile oluşturuldu" : ""}
      </footer>
    </div>
  );
}
