import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/client";

/**
 * POST /api/stripe/portal — opens the Stripe billing portal for the signed-in
 * owner's business, where they can switch plans, update the card or cancel.
 * Plan changes made there come back through the webhook.
 */
export async function POST() {
  if (!isStripeConfigured() || !supabaseConfigured) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) {
    return NextResponse.json({ error: "No business found for this account" }, { status: 404 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("business_id", business.id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl}/settings`,
    locale: "tr",
  });

  return NextResponse.json({ url: session.url });
}
