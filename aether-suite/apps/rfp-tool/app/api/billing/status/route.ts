import { withAuth } from "@aether/auth";
import { connectDB, User } from "@aether/db";
import { PLANS } from "@aether/billing";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_request, context) => {
  await connectDB();

  const user = await User.findById(context.user.id)
    .select("subscriptionStatus usageCredits products")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const plan = user.subscriptionStatus === "pro" ? "pro" : user.subscriptionStatus === "pay_per_use" ? "pay_per_use" : "free";
  const limits = plan === "pro" ? PLANS.PRO.limits : PLANS.FREE.limits;

  return NextResponse.json({
    plan,
    subscriptionStatus: user.subscriptionStatus,
    usageCredits: user.usageCredits,
    limits,
    usage: user.products
  });
});
