"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, MapPin, ExternalLink, MessageSquare, Check } from "lucide-react";
import appConfig from "@/app.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/components/i18n/language-provider";
import { useWorkspace } from "@/components/app/workspace-context";

export function SettingsClient({ connected }: { connected: Record<string, boolean> }) {
  const { t, ui, lang } = useLang();
  const { location, setLocation, business } = useWorkspace();

  // Business location — feeds the booking page and the "directions" link in
  // reminder SMS. Saved into the workspace (localStorage until Supabase is wired).
  const [address, setAddress] = useState(location.address);
  const [mapsUrl, setMapsUrl] = useState(location.mapsUrl);
  const [saved, setSaved] = useState(false);
  const pickOnMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || business.name)}`;

  function save() {
    setLocation({ address: address.trim(), mapsUrl: mapsUrl.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Brand */}
      <Card>
        <CardHeader>
          <CardTitle>{ui.brand}</CardTitle>
          <p className="text-sm text-muted-foreground">{ui.brandHint}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{ui.productName}</Label>
            <Input defaultValue={appConfig.name} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>{ui.domain}</Label>
            <Input defaultValue={appConfig.domain} readOnly />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{ui.tagline}</Label>
            <Input defaultValue={t(appConfig.tagline)} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Location — powers the booking page address + SMS directions */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "tr" ? "Konum" : "Location"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {lang === "tr"
              ? "Adresin rezervasyon sayfanda görünür ve randevudan 2 saat önceki SMS'e yol tarifi bağlantısı olarak eklenir."
              : "Your address appears on your booking page and is attached to the 2-hour reminder SMS as a directions link."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{lang === "tr" ? "Adres" : "Address"}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={lang === "tr" ? "Mahalle, cadde, no, ilçe, il" : "Street, number, district, city"} />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "tr" ? "Google Maps bağlantısı" : "Google Maps link"}</Label>
            <Input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/…" />
            <p className="text-[12px] text-muted-foreground">
              {lang === "tr"
                ? "Haritada konumunu doğrula, sonra Paylaş → Bağlantıyı kopyala ile linki buraya yapıştır."
                : "Verify your pin on the map, then Share → Copy link and paste it here."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={pickOnMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted"
            >
              <MapPin className="h-4 w-4 text-primary" />
              {lang === "tr" ? "Google Maps'te konumu seç / doğrula" : "Pick / verify on Google Maps"}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted"
              >
                {lang === "tr" ? "Kayıtlı konumu aç" : "Open saved location"}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
          </div>
          {/* SMS preview — exactly what the 2h reminder will carry */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="flex items-center gap-1.5 label-mono text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {lang === "tr" ? "SMS yol tarifi önizleme (2s hatırlatma)" : "SMS directions preview (2h reminder)"}
            </p>
            <p className="mt-2 break-all text-[12.5px] leading-relaxed text-foreground/80">
              {lang === "tr"
                ? `Bugun saat 14:00 randevunuz var: Sac kesimi @ ${business.name}. Yol tarifi: ${mapsUrl || "—"} Gorusmek uzere!`
                : `Today at 14:00: Haircut @ ${business.name}. Directions: ${mapsUrl || "—"} See you soon!`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>{ui.integrations}</CardTitle>
          <p className="text-sm text-muted-foreground">{ui.integrationsHint}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {appConfig.integrations.map((it) => (
            <div key={it.key} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon name="plug" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{it.name}</p>
                  {it.required && <Badge tone="warning">{ui.required}</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{it.purpose}</p>
              </div>
              {connected[it.key] ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <CheckCircle2 className="h-4 w-4" /> {ui.connected}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <CircleDashed className="h-4 w-4" /> {ui.demoMode}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-success">
            <Check className="h-4 w-4" />
            {lang === "tr" ? "Kaydedildi" : "Saved"}
          </span>
        )}
        <Button onClick={save}>{ui.saveChanges}</Button>
      </div>
    </div>
  );
}
