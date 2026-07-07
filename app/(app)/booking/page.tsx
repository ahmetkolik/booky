"use client";

import { useState } from "react";
import {
  Globe,
  Copy,
  Check,
  Share2,
  Star,
  CalendarPlus,
  Clock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatPrice, formatDuration, minutesToHHMM } from "@/lib/utils";
import { SERVICE_VAR } from "@/lib/demo/data";
import { useWorkspace, initialsOf } from "@/components/app/workspace-context";

/** Mini booking widget embedded in the preview panel. */
function BookingWidget() {
  const { t, lang } = useLang();
  const { bookingInfo, serviceById } = useWorkspace();
  const [serviceId, setServiceId] = useState(bookingInfo.options[0] ?? "");
  const [slot, setSlot] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    if (slot === null) return;
    setConfirmed(true);
    setTimeout(() => { setConfirmed(false); setSlot(null); }, 2500);
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      {/* Business header */}
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
            {initialsOf(bookingInfo.business)}
          </span>
          <div>
            <p className="font-semibold leading-tight">{bookingInfo.business}</p>
            <p className="text-[12px] text-muted-foreground">{t(bookingInfo.tagline)}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-semibold text-foreground">{bookingInfo.rating}</span>
            <span>({bookingInfo.reviews})</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {confirmed ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <p className="font-semibold">{lang === "tr" ? "Rezervasyon onaylandı!" : "Booking confirmed!"}</p>
            <p className="text-[12px] text-muted-foreground text-center">
              {lang === "tr"
                ? "SMS & e-posta onayı gönderildi."
                : "SMS & email confirmation sent."}
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Service */}
            <div>
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "1 · Hizmet seç" : "1 · Choose a service"}</p>
              <div className="mt-2 space-y-2">
                {bookingInfo.options.length === 0 && (
                  <Link
                    href="/services"
                    className="block rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12.5px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {lang === "tr" ? "Henüz hizmet yok — eklemek için tıkla." : "No services yet — click to add."}
                  </Link>
                )}
                {bookingInfo.options.map((id) => {
                  const sv = serviceById(id);
                  const sel = id === serviceId;
                  return (
                    <button
                      key={id}
                      onClick={() => setServiceId(id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        sel ? "border-primary/50 bg-primary/[0.05]" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <span className="h-3 w-3 rounded-[4px]" style={{ background: SERVICE_VAR[sv.color] }} />
                      <span className="flex-1 min-w-0 truncate text-[13px] font-medium">{t(sv.name)}</span>
                      <span className="tnum flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(sv.durationMin)}
                      </span>
                      <span className="tnum text-[13px] font-semibold">{formatPrice(sv.price)}</span>
                      {sel && (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time */}
            <div>
              <p className="label-mono text-muted-foreground">{lang === "tr" ? "2 · Saat seç" : "2 · Pick a time"}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {bookingInfo.slots.map((min) => {
                  const sel = slot === min;
                  return (
                    <button
                      key={min}
                      onClick={() => setSlot(min)}
                      className={cn(
                        "tnum rounded-md border py-2 text-center text-[12.5px] transition-colors",
                        sel
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/50",
                      )}
                    >
                      {minutesToHHMM(min)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deposit note */}
            {serviceId !== "" && serviceById(serviceId).deposit > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary" />
                {lang === "tr"
                  ? `Rezervasyon için ${formatPrice(serviceById(serviceId).deposit)} depozito alınacak.`
                  : `A ${formatPrice(serviceById(serviceId).deposit)} deposit is required to hold your slot.`}
              </div>
            )}

            {/* Confirm */}
            <button
              onClick={confirm}
              disabled={slot === null || serviceId === ""}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <CalendarPlus className="h-4 w-4" />
              {lang === "tr" ? "Rezervasyonu tamamla" : "Confirm booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Copy-to-clipboard button. */
function CopyButton({ text }: { text: string }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  function copy() {
    // Clipboard API is absent on non-secure origins — feedback must not depend on it.
    try {
      navigator.clipboard?.writeText(`https://${text}`).catch(() => {});
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium transition-colors hover:bg-muted"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
      {copied ? (lang === "tr" ? "Kopyalandı" : "Copied!") : (lang === "tr" ? "Kopyala" : "Copy link")}
    </button>
  );
}

export default function BookingPage() {
  const { t, lang } = useLang();
  const { bookingInfo, serviceById } = useWorkspace();
  const [shared, setShared] = useState(false);

  function share() {
    const url = `https://${bookingInfo.url}`;
    if (navigator.share) {
      navigator.share({ title: bookingInfo.business, url }).catch(() => {});
    } else {
      try {
        navigator.clipboard?.writeText(url).catch(() => {});
      } catch {}
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {lang === "tr" ? "Rezervasyon sayfası" : "Booking page"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Müşterilerle paylaşabileceğin herkese açık rezervasyon sayfan."
              : "Your public booking page — share it with clients anywhere."}
          </p>
        </div>
      </div>

      {/* URL card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Globe className="h-4 w-4 text-primary" />
          <span>{lang === "tr" ? "Herkese açık bağlantı" : "Public link"}</span>
          <span className="ml-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
            {lang === "tr" ? "canlı" : "live"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="tnum truncate text-[13px] font-medium">{bookingInfo.url}</span>
          </div>
          <CopyButton text={bookingInfo.url} />
          <button
            onClick={share}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {shared ? (lang === "tr" ? "Kopyalandı!" : "Copied!") : (lang === "tr" ? "Paylaş" : "Share")}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
            <h2 className="font-display text-[15px] font-semibold">
              {lang === "tr" ? "Sayfa ayarları" : "Page settings"}
            </h2>

            <div className="space-y-3 text-[13px]">
              {/* Business name */}
              <div className="space-y-1.5">
                <label className="label-mono text-muted-foreground">{lang === "tr" ? "İşletme adı" : "Business name"}</label>
                <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 font-medium">
                  {bookingInfo.business}
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="label-mono text-muted-foreground">{lang === "tr" ? "Slogan" : "Tagline"}</label>
                <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-muted-foreground">
                  {t(bookingInfo.tagline)}
                </div>
              </div>

              {/* Offered services */}
              <div className="space-y-1.5">
                <label className="label-mono text-muted-foreground">{lang === "tr" ? "Sunulan hizmetler" : "Offered services"}</label>
                <div className="space-y-1.5">
                  {bookingInfo.options.length === 0 && (
                    <Link
                      href="/services"
                      className="block rounded-lg border border-dashed border-border px-3 py-3 text-center text-[12px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {lang === "tr" ? "Hizmet ekleyince burada görünür — eklemek için tıkla." : "Services show up here — click to add one."}
                    </Link>
                  )}
                  {bookingInfo.options.map((id) => {
                    const sv = serviceById(id);
                    return (
                      <div key={id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[sv.color] }} />
                        <span className="flex-1 font-medium">{t(sv.name)}</span>
                        <span className="tnum text-[11px] text-muted-foreground">{formatPrice(sv.price)}</span>
                        <Check className="h-4 w-4 text-success" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft text-center">
              <p className="tnum text-2xl font-bold leading-none">{bookingInfo.rating}</p>
              <div className="mt-1 flex justify-center">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{lang === "tr" ? "Puan" : "Rating"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft text-center">
              <p className="tnum text-2xl font-bold leading-none">{bookingInfo.reviews}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">{lang === "tr" ? "Değerlendirme" : "Reviews"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft text-center">
              <p className="tnum text-2xl font-bold leading-none">{bookingInfo.options.length}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">{lang === "tr" ? "Aktif hizmet" : "Active services"}</p>
            </div>
          </div>

          {/* Info strip */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft text-[12.5px] text-muted-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            {lang === "tr"
              ? "Bu sayfayı Instagram bio'na, WhatsApp'a veya web sitene ekleyerek müşterilerinin seni 7/24 rezerve etmesini sağla."
              : "Add this link to your Instagram bio, WhatsApp or website so clients can book you 24/7 without calling."}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="space-y-3">
          <p className="label-mono text-muted-foreground">{lang === "tr" ? "Canlı önizleme" : "Live preview"}</p>
          <BookingWidget />
        </div>
      </div>
    </div>
  );
}
