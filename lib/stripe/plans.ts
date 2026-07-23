/**
 * Stripe subscription plan definitions in TRY.
 *
 * Price IDs come from env vars so they can differ between test and live mode.
 * When keys are absent the app runs in demo mode — no actual billing.
 */

export interface Plan {
  id: "solo" | "pro" | "isletme";
  name: string;
  /** Amount in kuruş (1 TRY = 100 kuruş), 0 = free */
  amountKurus: number;
  currency: "try";
  interval: "month" | null;
  stripePriceId: string | null;
  maxStaff: number | null;
  maxBookingsPerMonth: number | null;
}

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    amountKurus: 0,
    currency: "try",
    interval: null,
    stripePriceId: null,
    maxStaff: 1,
    maxBookingsPerMonth: 50,
  },
  {
    id: "pro",
    name: "Pro",
    // Keep in sync with app.config.ts marketing.pricing — shown on the pricing
    // page and here before checkout, must match what Stripe actually charges.
    amountKurus: 89900,
    currency: "try",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    maxStaff: 5,
    maxBookingsPerMonth: null,
  },
  {
    id: "isletme",
    name: "İşletme",
    amountKurus: 179900,
    currency: "try",
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ISLETME ?? null,
    maxStaff: null,
    maxBookingsPerMonth: null,
  },
];

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<Plan["id"], Plan>;

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.stripePriceId === priceId);
}
