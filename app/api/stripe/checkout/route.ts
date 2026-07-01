import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { PLAN_BY_ID, type Plan } from "@/lib/stripe/plans";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const planId = body.planId as Plan["id"] | undefined;

  if (!planId || planId === "solo") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = PLAN_BY_ID[planId];
  if (!plan?.stripePriceId) {
    return NextResponse.json({ error: "Price ID not configured for this plan" }, { status: 503 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscription=success&plan=${planId}`,
    cancel_url: `${appUrl}/#pricing`,
    subscription_data: {
      metadata: { planId },
    },
    locale: "tr",
    currency: "try",
  });

  return NextResponse.json({ url: session.url });
}
