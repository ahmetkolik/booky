import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getPlanByPriceId } from "@/lib/stripe/plans";

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: persist to Supabase when auth is wired
      console.log("[stripe] checkout.session.completed", {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const plan = priceId ? getPlanByPriceId(priceId) : undefined;
      console.log(`[stripe] ${event.type}`, {
        subscriptionId: sub.id,
        status: sub.status,
        planId: plan?.id,
      });
      // TODO: update business subscription status in Supabase
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
