/**
 * POST /api/reminders/send
 *
 * Called by a Vercel Cron job (or manually) to dispatch SMS reminders.
 * Protected with a shared secret via Authorization header.
 *
 * Body: { type: ReminderType; lang: "tr"|"en"; phone: string; data: TemplateData }
 *
 * In production with Supabase, this endpoint will be called by a scheduled
 * function that queries bookings due for reminders. For now it accepts explicit
 * payloads so it can be tested immediately with curl.
 *
 * İYS compliance: caller MUST verify smsConsent === true before calling this
 * endpoint. This endpoint trusts that the caller has already checked consent.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendSms, isSmsConfigured } from "@/lib/sms/client";
import { buildSmsMessage, type ReminderType, type Lang } from "@/lib/sms/templates";
import { bookingPage } from "@/lib/demo/data";

const CRON_SECRET = process.env.CRON_SECRET;

function authorized(req: NextRequest): boolean {
  if (!CRON_SECRET) return true; // dev: skip auth when secret not set
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { type, lang = "tr", phone, data } = body as {
    type: ReminderType;
    lang?: Lang;
    phone: string;
    data: Parameters<typeof buildSmsMessage>[2];
  };

  if (!type || !phone || !data) {
    return NextResponse.json({ error: "Missing type, phone or data" }, { status: 400 });
  }

  // Default the directions link to the business location (Settings → Location;
  // demo data until Supabase is wired) so the 2h reminder always carries it.
  const message = buildSmsMessage(type, lang, { mapsUrl: bookingPage.mapsUrl, ...data });

  // Demo mode: no Twilio keys — return the built message so the template
  // (including the directions link) can be verified with a simple curl.
  if (!isSmsConfigured()) {
    return NextResponse.json({ success: false, demo: true, error: "not_configured", preview: message });
  }

  const result = await sendSms(phone, message);
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
