import { AnalyticsEvent, UsageLog, User, connectDB } from "@aether/db";

export interface AIRequestsByProvider {
  provider: string;
  count: number;
  cost: number;
}

export interface SystemStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalAIRequests: number;
  totalTokensUsed: number;
  totalCostUSD: number;
  aiRequestsByProvider: AIRequestsByProvider[];
  errorRate: number;
}

const EMPTY_SYSTEM_STATS: SystemStats = {
  totalUsers: 0,
  newUsersToday: 0,
  newUsersThisMonth: 0,
  totalAIRequests: 0,
  totalTokensUsed: 0,
  totalCostUSD: 0,
  aiRequestsByProvider: [],
  errorRate: 0,
};

export async function getSystemStats(): Promise<SystemStats> {
  try {
    await connectDB();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsersRows,
      newUsersTodayRows,
      newUsersThisMonthRows,
      usageTotalsRows,
      aiRequestsByProvider,
      errorRows,
    ] = await Promise.all([
      User.aggregate<{ totalUsers: number }>([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
          },
        },
      ]),
      User.aggregate<{ newUsersToday: number }>([
        {
          $match: {
            createdAt: { $gte: todayStart },
          },
        },
        {
          $group: {
            _id: null,
            newUsersToday: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            newUsersToday: 1,
          },
        },
      ]),
      User.aggregate<{ newUsersThisMonth: number }>([
        {
          $match: {
            createdAt: { $gte: monthStart },
          },
        },
        {
          $group: {
            _id: null,
            newUsersThisMonth: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            newUsersThisMonth: 1,
          },
        },
      ]),
      UsageLog.aggregate<{ totalAIRequests: number; totalTokensUsed: number; totalCostUSD: number }>([
        {
          $group: {
            _id: null,
            totalAIRequests: { $sum: 1 },
            totalTokensUsed: { $sum: "$tokensUsed" },
            totalCostUSD: { $sum: "$cost" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAIRequests: 1,
            totalTokensUsed: 1,
            totalCostUSD: 1,
          },
        },
      ]),
      UsageLog.aggregate<AIRequestsByProvider>([
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
            cost: { $sum: "$cost" },
          },
        },
        {
          $project: {
            _id: 0,
            provider: "$_id",
            count: 1,
            cost: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      AnalyticsEvent.aggregate<{ event: string; count: number }>([
        {
          $match: {
            event: { $in: ["ai_generate_started", "ai_generate_failed"] },
          },
        },
        {
          $group: {
            _id: "$event",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            event: "$_id",
            count: 1,
          },
        },
      ]),
    ]);

    const started = errorRows.find((row: { event: string; count: number }) => row.event === "ai_generate_started")?.count ?? 0;
    const failed = errorRows.find((row: { event: string; count: number }) => row.event === "ai_generate_failed")?.count ?? 0;

    return {
      totalUsers: totalUsersRows[0]?.totalUsers ?? 0,
      newUsersToday: newUsersTodayRows[0]?.newUsersToday ?? 0,
      newUsersThisMonth: newUsersThisMonthRows[0]?.newUsersThisMonth ?? 0,
      totalAIRequests: usageTotalsRows[0]?.totalAIRequests ?? 0,
      totalTokensUsed: usageTotalsRows[0]?.totalTokensUsed ?? 0,
      totalCostUSD: Number((usageTotalsRows[0]?.totalCostUSD ?? 0).toFixed(6)),
      aiRequestsByProvider: aiRequestsByProvider.map((entry: AIRequestsByProvider) => ({
        provider: entry.provider,
        count: entry.count,
        cost: Number(entry.cost.toFixed(6)),
      })),
      errorRate: started > 0 ? Number(((failed / started) * 100).toFixed(2)) : 0,
    };
  } catch (error: unknown) {
    console.warn("[analytics] Failed to build system stats", error);
    return EMPTY_SYSTEM_STATS;
  }
}
