import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (
    !secretKey ||
    secretKey.startsWith("sk_test_placeholder") ||
    secretKey === "null" ||
    secretKey.trim() === ""
  ) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2026-10-28.endive",
      typescript: true,
    });
  }

  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return Boolean(
    secretKey &&
      !secretKey.includes("placeholder") &&
      secretKey !== "null" &&
      secretKey.startsWith("sk_")
  );
}

export function getStripePublishableKey(): string | null {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk || pk.includes("placeholder") || pk === "null" || pk.trim() === "") {
    return null;
  }
  return pk;
}
