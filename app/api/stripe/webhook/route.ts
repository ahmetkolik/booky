import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getPlanByPriceId, type Plan } from "@/lib/stripe/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  // A failed DB write must NOT be acknowledged with 200, or Stripe stops
  // retrying and the business keeps the wrong plan forever.
  const fail = (what: string, err: unknown) => {
    console.error(`[stripe] ${event.type}: ${what} failed`, err);
    return NextResponse.json({ error: `${what} failed` }, { status: 500 });
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.client_reference_id ?? (session.metadata?.businessId as string | undefined);
      const planId = session.metadata?.planId as Plan["id"] | undefined;

      if (admin && businessId) {
        const { error: subErr } = await admin.from("subscriptions").upsert({
          business_id: businessId,
          stripe_customer_id: String(session.customer ?? ""),
          stripe_subscription_id: String(session.subscription ?? ""),
          plan_id: planId ?? null,
          status: "active",
          updated_at: new Date().toISOString(),
        });
        if (subErr) return fail("subscriptions upsert", subErr);
        if (planId) {
          const { error: bizErr } = await admin.from("businesses").update({ plan: planId }).eq("id", businessId);
          if (bizErr) return fail("businesses plan update", bizErr);
        }
      } else {
        console.log("[stripe] checkout.session.completed (no businessId / admin client)", {
          sessionId: session.id,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const item = sub.items.data[0];
      const plan = item ? getPlanByPriceId(item.price.id) : undefined;
      const businessId = sub.metadata?.businessId as string | undefined;

      if (admin && businessId) {
        const { error: subErr } = await admin.from("subscriptions").upsert({
          business_id: businessId,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
          stripe_subscription_id: sub.id,
          plan_id: plan?.id ?? null,
          status: sub.status,
          current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        });
        if (subErr) return fail("subscriptions upsert", subErr);
        // Paid features only while Stripe says the subscription is in good
        // standing (past_due keeps access during Stripe's retry window).
        const inGoodStanding = ["active", "trialing", "past_due"].includes(sub.status);
        const nextPlan: Plan["id"] =
          event.type === "customer.subscription.deleted" || !inGoodStanding ? "solo" : plan?.id ?? "solo";
        const { error: bizErr } = await admin.from("businesses").update({ plan: nextPlan }).eq("id", businessId);
        if (bizErr) return fail("businesses plan update", bizErr);
      } else {
        console.log(`[stripe] ${event.type} (no businessId / admin client)`, {
          subscriptionId: sub.id,
          status: sub.status,
          planId: plan?.id,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
