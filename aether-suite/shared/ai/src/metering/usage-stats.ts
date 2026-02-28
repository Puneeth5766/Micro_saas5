import { connectDB, UsageLog } from "@aether/db";

type DailyUsagePoint = {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
};

type ProductBreakdown = {
  productId: string;
  requests: number;
  tokens: number;
  cost: number;
};

export type UsageStats = {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  requestsThisMonth: number;
  tokensThisMonth: number;
  costThisMonth: number;
  perProduct?: ProductBreakdown[];
  dailyUsage: DailyUsagePoint[];
};

export type SystemStats = {
  requests: number;
  tokens: number;
  cost: number;
  activeUsers: number;
};

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function thirtyDaysAgo(date: Date): Date {
  return new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);
}

export async function getUsageStats(userId: string, productId?: string): Promise<UsageStats> {
  await connectDB();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const rollingStart = thirtyDaysAgo(now);

  const baseMatch: Record<string, unknown> = { userId };
  if (productId) {
    baseMatch.productId = productId;
  }

  const [totals, monthTotals, perProduct, daily] = await Promise.all([
    UsageLog.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: "$tokensUsed" },
          totalCost: { $sum: "$cost" }
        }
      }
    ]),
    UsageLog.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: null,
          requestsThisMonth: { $sum: 1 },
          tokensThisMonth: { $sum: "$tokensUsed" },
          costThisMonth: { $sum: "$cost" }
        }
      }
    ]),
    productId
      ? Promise.resolve([])
      : UsageLog.aggregate([
          { $match: baseMatch },
          {
            $group: {
              _id: "$productId",
              requests: { $sum: 1 },
              tokens: { $sum: "$tokensUsed" },
              cost: { $sum: "$cost" }
            }
          },
          { $sort: { requests: -1 } }
        ]),
    UsageLog.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: rollingStart } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          requests: { $sum: 1 },
          tokens: { $sum: "$tokensUsed" },
          cost: { $sum: "$cost" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])
  ]);

  const totalsDoc = totals[0] as { totalRequests: number; totalTokens: number; totalCost: number } | undefined;
  const monthDoc = monthTotals[0] as {
    requestsThisMonth: number;
    tokensThisMonth: number;
    costThisMonth: number;
  } | undefined;

  return {
    totalRequests: totalsDoc?.totalRequests ?? 0,
    totalTokens: totalsDoc?.totalTokens ?? 0,
    totalCost: Number((totalsDoc?.totalCost ?? 0).toFixed(8)),
    requestsThisMonth: monthDoc?.requestsThisMonth ?? 0,
    tokensThisMonth: monthDoc?.tokensThisMonth ?? 0,
    costThisMonth: Number((monthDoc?.costThisMonth ?? 0).toFixed(8)),
    perProduct: productId
      ? undefined
      : (perProduct as Array<{ _id: string; requests: number; tokens: number; cost: number }>).map((item) => ({
          productId: item._id,
          requests: item.requests,
          tokens: item.tokens,
          cost: Number(item.cost.toFixed(8))
        })),
    dailyUsage: (daily as Array<{
      _id: { year: number; month: number; day: number };
      requests: number;
      tokens: number;
      cost: number;
    }>).map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
      requests: item.requests,
      tokens: item.tokens,
      cost: Number(item.cost.toFixed(8))
    }))
  };
}

export async function getSystemStats(): Promise<SystemStats> {
  await connectDB();

  const [totals, activeUsers] = await Promise.all([
    UsageLog.aggregate([
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          tokens: { $sum: "$tokensUsed" },
          cost: { $sum: "$cost" }
        }
      }
    ]),
    UsageLog.distinct("userId")
  ]);

  const total = totals[0] as { requests: number; tokens: number; cost: number } | undefined;

  return {
    requests: total?.requests ?? 0,
    tokens: total?.tokens ?? 0,
    cost: Number((total?.cost ?? 0).toFixed(8)),
    activeUsers: activeUsers.length
  };
}
