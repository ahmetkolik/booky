/**
 * GET /api/reminders/cron
 *
 * Called by Vercel Cron (see vercel.json). Sends each appointment's SMS
 * reminders exactly once, only to clients who opted in (sms_consent, İYS):
 *
 *   • reminder_24h — appointments starting in the next 3–36 hours
 *   • reminder_2h  — appointments starting in the next 3 hours (with directions)
 *
 * The 36h window means a once-a-day cron still reaches every appointment of
 * the next day; run it hourly (Vercel Pro) to make the 2h reminder reliable.
 *
 * Each row is claimed with a conditional UPDATE (…_sent_at IS NULL) before the
 * SMS goes out, so overlapping runs can't double-send; a failed send releases
 * the claim so the next run retries.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms, isSmsConfigured, toE164 } from "@/lib/sms/client";
import { buildSmsMessage, type ReminderType } from "@/lib/sms/templates";

export const runtime = "nodejs";

const HOUR = 3_600_000;
const BATCH = 200;

interface DueRow {
  id: string;
  client_name: string;
  client_phone: string;
  starts_at: string;
  businesses: { name: string; slug: string; maps_url: string | null; timezone: string | null } | null;
  services: { name_tr: string } | null;
  staff: { name: string } | null;
}

type Column = "reminder_24h_sent_at" | "reminder_2h_sent_at";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  // Fail closed outside local dev: Vercel Cron sends `Bearer $CRON_SECRET`.
  const allowed = cronSecret ? auth === `Bearer ${cronSecret}` : process.env.NODE_ENV === "development";
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({
      status: "demo_mode",
      message: "Supabase service role not configured — no reminders sent.",
      dispatched: 0,
    });
  }

  const now = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  async function due(column: Column, fromMs: number, toMs: number) {
    const { data, error } = await admin!
      .from("appointments")
      .select(
        "id, client_name, client_phone, starts_at, businesses(name, slug, maps_url, timezone), services(name_tr), staff(name)",
      )
      .eq("status", "booked")
      .eq("sms_consent", true)
      .is(column, null)
      .gt("starts_at", new Date(fromMs).toISOString())
      .lte("starts_at", new Date(toMs).toISOString())
      .order("starts_at")
      .limit(BATCH);
    if (error) throw error;
    return (data ?? []) as unknown as DueRow[];
  }

  let due2h: DueRow[];
  let due24h: DueRow[];
  try {
    due2h = await due("reminder_2h_sent_at", now, now + 3 * HOUR);
    due24h = await due("reminder_24h_sent_at", now + 3 * HOUR, now + 36 * HOUR);
  } catch (err) {
    console.error("[reminders] query failed", err);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  if (!isSmsConfigured()) {
    // Don't mark anything as sent — they'll go out once Twilio is connected.
    return NextResponse.json({
      status: "sms_not_configured",
      due: { reminder_2h: due2h.length, reminder_24h: due24h.length },
      dispatched: 0,
    });
  }

  const results = { sent: 0, failed: 0, skipped: 0 };

  async function dispatch(rows: DueRow[], type: ReminderType, column: Column) {
    for (const row of rows) {
      const to = toE164(row.client_phone);
      if (!to) {
        results.skipped++;
        continue;
      }

      // Claim it — only one run gets the row.
      const claimedAt = new Date().toISOString();
      const { data: claimed } = await admin!
        .from("appointments")
        .update({ [column]: claimedAt })
        .eq("id", row.id)
        .is(column, null)
        .select("id");
      if (!claimed?.length) continue;

      const tz = row.businesses?.timezone || "Europe/Istanbul";
      const start = new Date(row.starts_at);
      const message = buildSmsMessage(type, "tr", {
        clientName: row.client_name,
        serviceName: row.services?.name_tr ?? "",
        staffName: row.staff?.name ?? "",
        businessName: row.businesses?.name ?? "",
        date: start.toLocaleDateString("tr-TR", { timeZone: tz, day: "numeric", month: "long" }),
        time: start.toLocaleTimeString("tr-TR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }),
        bookingUrl: appUrl && row.businesses?.slug ? `${appUrl}/book/${row.businesses.slug}` : undefined,
        mapsUrl: row.businesses?.maps_url ?? undefined,
      });

      const res = await sendSms(to, message);
      if (res.success) {
        results.sent++;
        // A 2h reminder makes a still-pending 24h one pointless.
        if (type === "reminder_2h") {
          await admin!.from("appointments").update({ reminder_24h_sent_at: claimedAt }).eq("id", row.id).is("reminder_24h_sent_at", null);
        }
      } else {
        results.failed++;
        await admin!.from("appointments").update({ [column]: null }).eq("id", row.id);
      }
    }
  }

  await dispatch(due2h, "reminder_2h", "reminder_2h_sent_at");
  await dispatch(due24h, "reminder_24h", "reminder_24h_sent_at");

  return NextResponse.json({ status: "ok", ...results });
}
