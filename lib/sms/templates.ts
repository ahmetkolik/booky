/**
 * SMS templates — Turkish primary, English fallback.
 *
 * Keep messages under 160 chars (1 SMS segment) for cost efficiency.
 * Turkish GSM-7 extended chars (ş ğ ü ö ç ı İ) use 2 bytes → limit drops to ~70 chars.
 * Use ASCII-safe equivalents for budget: s/g/u/o/c/i → keeps 160 char limit.
 */

export type ReminderType = "confirmation" | "reminder_24h" | "reminder_2h" | "thankyou";
export type Lang = "tr" | "en";

interface TemplateData {
  clientName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
  /** Short cancellation / rebook link, e.g. https://app.com/book/slug */
  bookingUrl?: string;
  /** Google Maps link to the business — the "directions" (yol tarifi) in the
      2h reminder. Set in Settings → Location; falls back to the demo address. */
  mapsUrl?: string;
}

const TEMPLATES: Record<ReminderType, Record<Lang, (d: TemplateData) => string>> = {
  confirmation: {
    tr: (d) =>
      `Randevunuz onaylandi! ${d.serviceName} - ${d.date} ${d.time} @ ${d.businessName} (${d.staffName}). Iptal: ${d.bookingUrl ?? ""}`,
    en: (d) =>
      `Booking confirmed! ${d.serviceName} - ${d.date} ${d.time} @ ${d.businessName} (${d.staffName}). Cancel: ${d.bookingUrl ?? ""}`,
  },
  reminder_24h: {
    tr: (d) =>
      `Hatirlat: Yarin ${d.time} randevunuz var. ${d.serviceName} @ ${d.businessName}. Sorun var mi? ${d.bookingUrl ?? ""}`,
    en: (d) =>
      `Reminder: Tomorrow ${d.time} you have ${d.serviceName} @ ${d.businessName}. Need to change? ${d.bookingUrl ?? ""}`,
  },
  reminder_2h: {
    tr: (d) =>
      `Bugun saat ${d.time} randevunuz var: ${d.serviceName} @ ${d.businessName}.${d.mapsUrl ? ` Yol tarifi: ${d.mapsUrl}` : ""}${d.bookingUrl ? ` Onay: ${d.bookingUrl}` : ""} Gorusmek uzere!`,
    en: (d) =>
      `Today at ${d.time}: ${d.serviceName} @ ${d.businessName}.${d.mapsUrl ? ` Directions: ${d.mapsUrl}` : ""}${d.bookingUrl ? ` Confirm: ${d.bookingUrl}` : ""} See you soon!`,
  },
  thankyou: {
    tr: (d) =>
      `Tesekkurler ${d.clientName}! ${d.businessName}'i tercih ettiginiz icin sagolun. Tekrar rezervasyon: ${d.bookingUrl ?? ""}`,
    en: (d) =>
      `Thank you ${d.clientName}! We loved having you at ${d.businessName}. Book again: ${d.bookingUrl ?? ""}`,
  },
};

export function buildSmsMessage(type: ReminderType, lang: Lang, data: TemplateData): string {
  return TEMPLATES[type][lang](data);
}
