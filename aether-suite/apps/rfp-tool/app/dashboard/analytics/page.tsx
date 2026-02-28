import { getUserDashboardStats } from "@aether/analytics";
import { requireServerUser } from "@aether/auth";
import { UsageLog, connectDB } from "@aether/db";
import { UserAnalyticsDashboard, type ProviderUsageStat } from "./_components/UserAnalyticsDashboard";

export default async function AnalyticsPage() {
  const user = await requireServerUser();
  const stats = await getUserDashboardStats(user.id, "rfp-tool");

  await connectDB();

  const providerUsage = await UsageLog.aggregate<ProviderUsageStat>([
    {
      $match: {
        productId: "rfp-tool",
        $expr: { $eq: [{ $toString: "$userId" }, user.id] },
      },
    },
    {
      $group: {
        _id: "$provider",
        count: { $sum: 1 },
        cost: { $sum: "$cost" },
        tokens: { $sum: "$tokensUsed" },
      },
    },
    {
      $project: {
        _id: 0,
        provider: "$_id",
        count: 1,
        cost: 1,
        tokens: 1,
      },
    },
  ]);

  return <UserAnalyticsDashboard stats={stats} plan={user.subscriptionStatus} providerUsage={providerUsage} />;
}
