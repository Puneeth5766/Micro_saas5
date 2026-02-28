import { withAuth } from "@aether/auth";
import { createCreditPackCheckout, createSubscriptionCheckout } from "@aether/billing";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subscription"),
    priceId: z.string().min(1)
  }),
  z.object({
    type: z.literal("credit_pack"),
    packId: z.string().min(1)
  })
]);

export const POST = withAuth(async (request, context) => {
  const body = (await request.json()) as unknown;
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/dashboard/billing/success`;
  const cancelUrl = `${origin}/dashboard/billing`;

  if (parsed.data.type === "subscription") {
    const session = await createSubscriptionCheckout({
      userId: context.user.id,
      productId: "rfp-tool",
      priceId: parsed.data.priceId,
      successUrl,
      cancelUrl
    });

    return NextResponse.json({ url: session.url });
  }

  const session = await createCreditPackCheckout({
    userId: context.user.id,
    productId: "rfp-tool",
    packId: parsed.data.packId,
    successUrl,
    cancelUrl
  });

  return NextResponse.json({ url: session.url });
});
