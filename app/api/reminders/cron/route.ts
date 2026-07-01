/**
 * GET /api/reminders/cron
 *
 * Called by Vercel Cron (schedule: every 2h + daily 08:00 Europe/Istanbul).
 * Finds bookings that need reminders and dispatches SMS via /api/reminders/send.
 *
 * With Supabase wired: query appointments WHERE reminder_sent_at IS NULL
 * AND appointment_at BETWEEN NOW()+23h AND NOW()+25h (for 24h reminder), etc.
 *
 * In demo mode: no-ops and returns a summary.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({
      status: "demo_mode",
      message: "Supabase not configured — no reminders sent. Connect Supabase to enable real reminders.",
      dispatched: 0,
    });
  }

  // TODO: with Supabase wired, implement:
  // 1. Query bookings due for 24h reminder (appointment_at BETWEEN now+23h AND now+25h)
  // 2. Query bookings due for 2h reminder  (appointment_at BETWEEN now+1h AND now+3h)
  // 3. For each, call POST /api/reminders/send if smsConsent === true
  // 4. Mark reminder_sent_at = now() to prevent duplicates

  return NextResponse.json({ status: "ok", dispatched: 0 });
}
