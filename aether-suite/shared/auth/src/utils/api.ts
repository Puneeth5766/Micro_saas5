import { NextResponse } from "next/server";
import { checkUsageLimit } from "./session";
import { auth } from "../auth";
import { connectDB, User } from "@aether/db";
import type { IUserProductUsage, SubscriptionStatus } from "@aether/db";

export type AuthenticatedContext = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    subscriptionStatus: SubscriptionStatus;
    usageCredits: number;
  };
};

export type AuthenticatedHandler = (
  request: Request,
  context: AuthenticatedContext
) => Promise<Response> | Response;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request): Promise<Response> => {
    const session = await auth();

    if (!session?.user?.id || !session.user.email || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
        subscriptionStatus: session.user.subscriptionStatus,
        usageCredits: session.user.usageCredits
      }
    });
  };
}

export function withUsageLimit(handler: AuthenticatedHandler, productId: string) {
  return withAuth(async (request, context) => {
    const limit = await checkUsageLimit(context.user.id, productId);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Usage limit reached", upgradeUrl: "/billing" },
        { status: 429 }
      );
    }

    const response = await handler(request, context);

    if (response.ok) {
      await connectDB();

      const user = await User.findById(context.user.id).select("subscriptionStatus usageCredits products");
      if (user) {
        if (user.subscriptionStatus !== "pro" && user.usageCredits > 0) {
          user.usageCredits = Math.max(0, user.usageCredits - 1);
        }

        const usageEntry = user.products.find((entry: IUserProductUsage) => entry.productId === productId);
        if (usageEntry) {
          usageEntry.usageCount += 1;
          usageEntry.lastUsed = new Date();
        } else {
          user.products.push({
            productId,
            usageCount: 1,
            lastUsed: new Date()
          });
        }

        await user.save();
      }
    }

    return response;
  });
}
