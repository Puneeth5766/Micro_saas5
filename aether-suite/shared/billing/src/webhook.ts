import { env } from "@aether/config";
import { connectDB, User } from "@aether/db";
import Stripe from "stripe";
import { stripe } from "./stripe-client";
import { BillingError } from "./types";

function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return error instanceof Stripe.errors.StripeError;
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  if (status === "active") {
    return "pro";
  }

  if (status === "trialing") {
    return "trialing";
  }

  if (status === "past_due") {
    return "past_due";
  }

  if (status === "incomplete") {
    return "incomplete";
  }

  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "cancelled";
  }

  return "free";
}

export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: 400,
        code: "INVALID_WEBHOOK_SIGNATURE",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Invalid Stripe webhook signature.",
      statusCode: 400,
      code: "INVALID_WEBHOOK_SIGNATURE",
      originalError: error
    });
  }
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  await connectDB();
  console.info(`[billing.webhook] handling event ${event.id} (${event.type})`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) {
        return;
      }

      if (session.metadata?.type === "credit_pack") {
        const credits = Number(session.metadata.credits ?? "0");

        await User.findByIdAndUpdate(userId, {
          $inc: { usageCredits: credits },
          $set: {
            ...(session.customer ? { stripeCustomerId: String(session.customer) } : {}),
            subscriptionStatus: "pay_per_use"
          }
        });
      }

      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = String(subscription.customer);

      await User.findOneAndUpdate(
        { stripeCustomerId },
        {
          $set: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapSubscriptionStatus(subscription.status)
          }
        }
      );

      return;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = String(subscription.customer);

      await User.findOneAndUpdate(
        { stripeCustomerId },
        {
          $set: {
            subscriptionStatus: "cancelled",
            stripeSubscriptionId: null,
            usageCredits: 0
          }
        }
      );

      return;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.info(`[billing.webhook] invoice.payment_succeeded ${invoice.id} event=${event.id}`);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer ? String(invoice.customer) : null;

      if (stripeCustomerId) {
        await User.findOneAndUpdate(
          { stripeCustomerId },
          {
            $set: {
              subscriptionStatus: "past_due"
            }
          }
        );
      }

      return;
    }

    default:
      console.info(`[billing.webhook] unhandled event ${event.id} (${event.type})`);
      return;
  }
}
