"use client";

/**
 * Panel quick-action forms — the modals behind "+ Randevu", "Hizmet ekle",
 * "Personel ekle" and "Müşteri ekle". All of them write into the workspace
 * context (demo mode: session-only; fresh mode: persisted to localStorage).
 *
 * NewAppointmentProvider exposes useNewAppointment().open(prefill) so any
 * button in the panel (topbar, dashboard, calendar, client card) can launch
 * the same booking form.
 */

import { createContext, useContext, useState, type ReactNode } from "react";
import { X, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useLang } from "@/components/i18n/language-provider";
import { useWorkspace } from "@/components/app/workspace-context";
import { cn, minutesToHHMM, formatPrice } from "@/lib/utils";
import {
  dayStartMin,
  dayEndMin,
  slotMin,
  SERVICE_VAR,
  type Service,
  type ServiceColor,
} from "@/lib/demo/data";

/* ── Shared modal shell ───────────────────────────────────────────────────── */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { lang } = useLang();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto animate-pop rounded-2xl border border-border bg-card p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const selectCls =
  "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

/* ── New appointment (global) ─────────────────────────────────────────────── */

export interface ApptPrefill {
  client?: string;
  phone?: string;
}

const NewApptContext = createContext<{ open: (prefill?: ApptPrefill) => void }>({ open: () => {} });

export function useNewAppointment() {
  return useContext(NewApptContext);
}

export function NewAppointmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; prefill: ApptPrefill }>({ open: false, prefill: {} });
  return (
    <NewApptContext.Provider value={{ open: (prefill = {}) => setState({ open: true, prefill }) }}>
      {children}
      {state.open && (
        <NewAppointmentModal prefill={state.prefill} onClose={() => setState({ open: false, prefill: {} })} />
      )}
    </NewApptContext.Provider>
  );
}

function NewAppointmentModal({ prefill, onClose }: { prefill: ApptPrefill; onClose: () => void }) {
  const { lang, t } = useLang();
  const { services, staff, addAppointment, canAddBooking, planDef } = useWorkspace();

  const [client, setClient] = useState(prefill.client ?? "");
  const [phone, setPhone] = useState(prefill.phone ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [dayOffset, setDayOffset] = useState(0);
  const [startMin, setStartMin] = useState(dayStartMin + 2 * 60);

  const slots: number[] = [];
  for (let m = dayStartMin; m < dayEndMin; m += slotMin) slots.push(m);

  const missing = services.length === 0 || staff.length === 0;

  function save() {
    if (!client.trim() || !serviceId || !staffId) return;
    addAppointment({ client: client.trim(), clientPhone: phone.trim(), serviceId, staffId, dayOffset, startMin });
    onClose();
  }

  return (
    <Modal title={lang === "tr" ? "Yeni randevu" : "New appointment"} onClose={onClose}>
      {!canAddBooking ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-center">
          <Lock className="mx-auto h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">
            {lang === "tr"
              ? `${planDef.name} paketinde aylık ${planDef.maxBookingsPerMonth} randevu sınırına ulaştın.`
              : `You've hit the ${planDef.name} plan limit of ${planDef.maxBookingsPerMonth} bookings/month.`}
          </p>
          <Link href="/#pricing" className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:opacity-90">
            {lang === "tr" ? "Paketi yükselt →" : "Upgrade →"}
          </Link>
        </div>
      ) : missing ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-center text-sm">
          <p className="font-semibold">
            {lang === "tr" ? "Önce en az bir hizmet ve bir personel ekle." : "Add at least one service and one staff member first."}
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/services" onClick={onClose} className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:opacity-90">
              {lang === "tr" ? "Hizmet ekle" : "Add service"}
            </Link>
            <Link href="/staff" onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold hover:bg-muted">
              {lang === "tr" ? "Personel ekle" : "Add staff"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="na-client">{lang === "tr" ? "Müşteri adı" : "Client name"}</Label>
            <Input id="na-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder={lang === "tr" ? "örn. Elif Şahin" : "e.g. Jane Doe"} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="na-phone">{lang === "tr" ? "Telefon" : "Phone"}</Label>
            <Input id="na-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="na-service">{lang === "tr" ? "Hizmet" : "Service"}</Label>
            <select id="na-service" className={selectCls} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.name)} · {formatPrice(s.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="na-staff">{lang === "tr" ? "Personel" : "Staff"}</Label>
            <select id="na-staff" className={selectCls} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="na-day">{lang === "tr" ? "Gün" : "Day"}</Label>
              <select id="na-day" className={selectCls} value={dayOffset} onChange={(e) => setDayOffset(Number(e.target.value))}>
                <option value={0}>{lang === "tr" ? "Bugün" : "Today"}</option>
                <option value={1}>{lang === "tr" ? "Yarın" : "Tomorrow"}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="na-time">{lang === "tr" ? "Saat" : "Time"}</Label>
              <select id="na-time" className={selectCls} value={startMin} onChange={(e) => setStartMin(Number(e.target.value))}>
                {slots.map((m) => (
                  <option key={m} value={m}>{minutesToHHMM(m)}</option>
                ))}
              </select>
            </div>
          </div>
          <Button className="w-full" disabled={!client.trim()} onClick={save}>
            {lang === "tr" ? "Randevuyu oluştur" : "Create appointment"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ── Service form (add + edit) ────────────────────────────────────────────── */

const COLOR_LABEL: Record<ServiceColor, { tr: string; en: string }> = {
  hair: { tr: "Saç", en: "Hair" },
  color: { tr: "Boya", en: "Color" },
  spa: { tr: "Spa", en: "Spa" },
  nail: { tr: "Tırnak", en: "Nail" },
  train: { tr: "Antrenman", en: "Training" },
  clinic: { tr: "Klinik", en: "Clinic" },
};

export function ServiceFormModal({
  service,
  onClose,
}: {
  /** null = create new */
  service: Service | null;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const { addService, updateService, deleteService } = useWorkspace();

  const [name, setName] = useState(service ? t(service.name) : "");
  const [duration, setDuration] = useState(service?.durationMin ?? 45);
  const [price, setPrice] = useState(service?.price ?? 500);
  const [deposit, setDeposit] = useState(service?.deposit ?? 0);
  const [color, setColor] = useState<ServiceColor>(service?.color ?? "hair");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    if (!name.trim()) return;
    const payload = {
      name: { tr: name.trim(), en: name.trim() },
      durationMin: Math.max(5, duration),
      price: Math.max(0, price),
      deposit: Math.max(0, deposit),
      color,
    };
    if (service) updateService(service.id, payload);
    else addService(payload);
    onClose();
  }

  return (
    <Modal title={service ? (lang === "tr" ? "Hizmeti düzenle" : "Edit service") : (lang === "tr" ? "Hizmet ekle" : "Add service")} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sf-name">{lang === "tr" ? "Hizmet adı" : "Service name"}</Label>
          <Input id="sf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "tr" ? "örn. Saç kesimi" : "e.g. Haircut"} autoFocus />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sf-dur">{lang === "tr" ? "Süre (dk)" : "Duration (min)"}</Label>
            <Input id="sf-dur" type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-price">{lang === "tr" ? "Fiyat (₺)" : "Price (₺)"}</Label>
            <Input id="sf-price" type="number" min={0} step={50} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-dep">{lang === "tr" ? "Depozito (₺)" : "Deposit (₺)"}</Label>
            <Input id="sf-dep" type="number" min={0} step={50} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "tr" ? "Renk / kategori" : "Color / category"}</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(COLOR_LABEL) as ServiceColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  color === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERVICE_VAR[c] }} />
                {COLOR_LABEL[c][lang]}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full" disabled={!name.trim()} onClick={save}>
          {service ? (lang === "tr" ? "Değişiklikleri kaydet" : "Save changes") : (lang === "tr" ? "Hizmeti ekle" : "Add service")}
        </Button>
        {service && (
          <button
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true);
              deleteService(service.id);
              onClose();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 py-2 text-[12.5px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmDelete
              ? lang === "tr" ? "Emin misin? Randevuları da silinir — tekrar tıkla" : "Sure? Its bookings go too — click again"
              : lang === "tr" ? "Hizmeti sil" : "Delete service"}
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ── Staff form ───────────────────────────────────────────────────────────── */

export function StaffFormModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const { addStaff, canAddStaff, planDef } = useWorkspace();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState(9 * 60);
  const [end, setEnd] = useState(18 * 60);

  const hours: number[] = [];
  for (let m = 6 * 60; m <= 22 * 60; m += 30) hours.push(m);

  function save() {
    if (!name.trim()) return;
    const roleText = role.trim() || (lang === "tr" ? "Uzman" : "Specialist");
    addStaff({ name: name.trim(), role: { tr: roleText, en: roleText }, startMin: start, endMin: Math.max(end, start + 60) });
    onClose();
  }

  return (
    <Modal title={lang === "tr" ? "Personel ekle" : "Add staff member"} onClose={onClose}>
      {!canAddStaff ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-center">
          <Lock className="mx-auto h-5 w-5 text-primary" />
          <p className="text-sm font-semibold">
            {lang === "tr"
              ? `${planDef.name} paketi en fazla ${planDef.maxStaff} personel destekler.`
              : `The ${planDef.name} plan supports up to ${planDef.maxStaff} staff.`}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {lang === "tr" ? "Daha fazla personel için paketini yükselt." : "Upgrade your plan to add more members."}
          </p>
          <Link href="/#pricing" className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:opacity-90">
            {lang === "tr" ? "Paketi yükselt →" : "Upgrade →"}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stf-name">{lang === "tr" ? "Ad soyad" : "Full name"}</Label>
            <Input id="stf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "tr" ? "örn. Selin Aydın" : "e.g. Jane Doe"} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stf-role">{lang === "tr" ? "Rol / uzmanlık" : "Role / specialty"}</Label>
            <Input id="stf-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder={lang === "tr" ? "örn. Kıdemli stilist" : "e.g. Senior stylist"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="stf-start">{lang === "tr" ? "Mesai başlangıcı" : "Shift start"}</Label>
              <select id="stf-start" className={selectCls} value={start} onChange={(e) => setStart(Number(e.target.value))}>
                {hours.map((m) => (
                  <option key={m} value={m}>{minutesToHHMM(m)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stf-end">{lang === "tr" ? "Mesai bitişi" : "Shift end"}</Label>
              <select id="stf-end" className={selectCls} value={end} onChange={(e) => setEnd(Number(e.target.value))}>
                {hours.map((m) => (
                  <option key={m} value={m}>{minutesToHHMM(m)}</option>
                ))}
              </select>
            </div>
          </div>
          <Button className="w-full" disabled={!name.trim()} onClick={save}>
            {lang === "tr" ? "Personeli ekle" : "Add member"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ── Client form ──────────────────────────────────────────────────────────── */

export function ClientFormModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const { addClient } = useWorkspace();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function save() {
    if (!name.trim()) return;
    addClient({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    onClose();
  }

  return (
    <Modal title={lang === "tr" ? "Müşteri ekle" : "Add client"} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">{lang === "tr" ? "Ad soyad" : "Full name"}</Label>
          <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "tr" ? "örn. Elif Şahin" : "e.g. Jane Doe"} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-phone">{lang === "tr" ? "Telefon" : "Phone"}</Label>
          <Input id="cf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">E-posta</Label>
          <Input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />
        </div>
        <Button className="w-full" disabled={!name.trim()} onClick={save}>
          {lang === "tr" ? "Müşteriyi ekle" : "Add client"}
        </Button>
      </div>
    </Modal>
  );
}
