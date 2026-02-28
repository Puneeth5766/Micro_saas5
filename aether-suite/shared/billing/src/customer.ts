import { connectDB, User } from "@aether/db";
import Stripe from "stripe";
import { stripe } from "./stripe-client";
import { BillingError } from "./types";
function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return error instanceof Stripe.errors.StripeError;
}


export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  await connectDB();

  const user = await User.findById(userId).select("email name stripeCustomerId");
  if (!user) {
    throw new BillingError({
      message: "User not found.",
      statusCode: 404,
      code: "USER_NOT_FOUND"
    });
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId }
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return customer.id;
  } catch (error) {
    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: error.statusCode ?? 500,
        code: error.code ?? "STRIPE_CUSTOMER_CREATE_FAILED",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Failed to create Stripe customer.",
      statusCode: 500,
      code: "STRIPE_CUSTOMER_CREATE_FAILED",
      originalError: error
    });
  }
}

export async function syncCustomerFromStripe(stripeCustomerId: string): Promise<void> {
  try {
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (customer.deleted) {
      throw new BillingError({
        message: "Stripe customer has been deleted.",
        statusCode: 404,
        code: "STRIPE_CUSTOMER_DELETED"
      });
    }

    const userId = customer.metadata?.userId;
    if (!userId) {
      throw new BillingError({
        message: "Stripe customer metadata missing userId.",
        statusCode: 400,
        code: "STRIPE_METADATA_MISSING_USER_ID"
      });
    }

    await connectDB();

    await User.findByIdAndUpdate(userId, {
      $set: {
        stripeCustomerId,
        email: customer.email ?? undefined,
        name: customer.name ?? undefined
      }
    });
  } catch (error) {
    if (error instanceof BillingError) {
      throw error;
    }

    if (isStripeError(error)) {
      throw new BillingError({
        message: error.message,
        statusCode: error.statusCode ?? 500,
        code: error.code ?? "STRIPE_CUSTOMER_SYNC_FAILED",
        originalError: error
      });
    }

    throw new BillingError({
      message: "Failed to sync Stripe customer.",
      statusCode: 500,
      code: "STRIPE_CUSTOMER_SYNC_FAILED",
      originalError: error
    });
  }
}
