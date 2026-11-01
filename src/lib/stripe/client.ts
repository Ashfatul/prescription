import { loadStripe, Stripe as StripeClient } from "@stripe/stripe-js";

let stripePromise: Promise<StripeClient | null> | null = null;

export function getStripePromise(): Promise<StripeClient | null> | null {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk || pk.includes("placeholder") || !pk.startsWith("pk_")) {
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}
