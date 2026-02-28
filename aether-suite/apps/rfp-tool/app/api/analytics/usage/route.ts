import { withAuth } from "@aether/auth";
import { AnalyticsEvent, connectDB, UsageLog } from "@aether/db";
import { NextResponse } from "next/server";

const PRODUCT_ID = "rfp-tool" as const;

const GENERATION_EVENTS = ["rfp_generated", "ai_generate_completed"] as const;
const EXPORT_EVENTS = ["rfp_exported"] as const;

export const GET = withAuth(async (_request, context) => {
  await connectDB();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalGenerations,
    totalExports,
    thisMonthGenerations,
    thisMonthExports,
    usageSummary,
  ] = await Promise.all([
    AnalyticsEvent.countDocuments({
      userId: context.user.id,
      productId: PRODUCT_ID,
      event: { $in: GENERATION_EVENTS },
    }),
    AnalyticsEvent.countDocuments({
      userId: context.user.id,
      productId: PRODUCT_ID,
      event: { $in: EXPORT_EVENTS },
    }),
    AnalyticsEvent.countDocuments({
      userId: context.user.id,
      productId: PRODUCT_ID,
      event: { $in: GENERATION_EVENTS },
      createdAt: { $gte: thisMonthStart },
    }),
    AnalyticsEvent.countDocuments({
      userId: context.user.id,
      productId: PRODUCT_ID,
      event: { $in: EXPORT_EVENTS },
      createdAt: { $gte: thisMonthStart },
    }),
    UsageLog.aggregate<{ creditsUsed: number }>([
      {
        $match: {
          userId: context.user.id,
          productId: PRODUCT_ID,
        },
      },
      {
        $group: {
          _id: null,
          creditsUsed: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          creditsUsed: 1,
        },
      },
    ]),
  ]);

  return NextResponse.json({
    totalGenerations,
    totalExports,
    creditsUsed: usageSummary[0]?.creditsUsed ?? 0,
    thisMonth: {
      generations: thisMonthGenerations,
      exports: thisMonthExports,
    },
  });
});
