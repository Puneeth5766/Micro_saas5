import { withAuth } from "@aether/auth";
import { createBillingPortalSession } from "@aether/billing";
import { NextResponse } from "next/server";

export const POST = withAuth(async (request, context) => {
  const origin = new URL(request.url).origin;
  const session = await createBillingPortalSession(context.user.id, `${origin}/dashboard/billing`);

  return NextResponse.json({ url: session.url });
});
