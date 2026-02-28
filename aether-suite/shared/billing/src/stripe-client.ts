import { env } from "@aether/config";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
  typescript: true
});

let stripeJsPromise: Promise<StripeJs | null> | null = null;

export function getStripeJs(): Promise<StripeJs | null> {
  if (!stripeJsPromise) {
    stripeJsPromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  return stripeJsPromise as Promise<StripeJs | null>;
}
