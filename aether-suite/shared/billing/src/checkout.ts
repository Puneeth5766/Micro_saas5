import Stripe from "stripe";
import { PLANS } from "./plans";
import { stripe } from "./stripe-client";
import type { BillingPortalSession, CheckoutSession, ProductId } from "./types";
import { BillingError } from "./types";
import { getOrCreateStripeCustomer } from "./customer";
function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return error instanceof Stripe.errors.StripeError;
}


type SubscriptionCheckoutParams = {
  userId: string;
  productId: ProductId;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
};

type CreditPackCheckoutParams = {
  userId: string;
  productId: ProductId;
  packId: string;
  successUrl: string;
  cancelUrl: string;
};

function assertSession(session: Stripe.Checkout.Session): CheckoutSession {
  if (!session.url || !session.id) {
    throw new BillingError({
      message: "Stripe checkout session is missing URL or ID.",
      statusCode: 500,
      code: "INVALID_STRIPE_CHECKOUT_SESSION"
    });
  }

  return { url: session.url, sessionId: session.id };
}

function findPack(packId: string) {
  const packs = Object.values(PLANS.PAY_PER_USE).flat();
  return packs.find((pack) => pack.id === packId);
}

export async function createSubscriptionCheckout(params: SubscriptionCheckoutParams): Promise<CheckoutSession> {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(params.userId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        productId: params.productId,
        plan: "pro"
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto"
    });

    return assertSession(session);
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }

    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: error.statusCode ?? 500,
        code: error.code ?? "STRIPE_SUBSCRIPTION_CHECKOUT_FAILED",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Failed to create subscription checkout session.",
      statusCode: 500,
      code: "STRIPE_SUBSCRIPTION_CHECKOUT_FAILED",
      originalError: error
    });
  }
}

export async function createCreditPackCheckout(params: CreditPackCheckoutParams): Promise<CheckoutSession> {
  try {
    const pack = findPack(params.packId);
    if (!pack || pack.productId !== params.productId) {
      throw new BillingError({
        message: "Credit pack not found for product.",
        statusCode: 404,
        code: "CREDIT_PACK_NOT_FOUND"
      });
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(params.userId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [{ price: pack.stripePriceId, quantity: 1 }],
      success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        productId: params.productId,
        packId: pack.id,
        credits: String(pack.credits),
        type: "credit_pack"
      }
    });

    return assertSession(session);
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }

    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: error.statusCode ?? 500,
        code: error.code ?? "STRIPE_CREDIT_PACK_CHECKOUT_FAILED",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Failed to create credit pack checkout session.",
      statusCode: 500,
      code: "STRIPE_CREDIT_PACK_CHECKOUT_FAILED",
      originalError: error
    });
  }
}

export async function createBillingPortalSession(userId: string, returnUrl: string): Promise<BillingPortalSession> {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl
    });

    return { url: session.url };
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }

    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: error.statusCode ?? 500,
        code: error.code ?? "STRIPE_BILLING_PORTAL_FAILED",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Failed to create billing portal session.",
      statusCode: 500,
      code: "STRIPE_BILLING_PORTAL_FAILED",
      originalError: error
    });
  }
}
