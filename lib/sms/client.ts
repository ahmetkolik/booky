/**
 * Twilio SMS client wrapper.
 *
 * Turkey compliance notes:
 * - 6563 sayılı Elektronik Ticaret Kanunu & İYS (İleti Yönetim Sistemi) require
 *   explicit opt-in before sending commercial SMS.
 * - Store `smsConsent: true` with each booking; never send without it.
 * - Sender ID / originator must be registered with Twilio Turkey short codes
 *   or an approved alpha-numeric sender via a local Turkish carrier integration.
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER,
  );
}

export async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!isSmsConfigured()) {
    console.warn("[sms] Twilio not configured — skipping SMS to", to);
    return { success: false, error: "not_configured" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  const encoded = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[sms] Twilio error", err);
    return { success: false, error: (err as { message?: string }).message ?? "unknown" };
  }

  const data = (await res.json()) as { sid: string };
  return { success: true, sid: data.sid };
}
