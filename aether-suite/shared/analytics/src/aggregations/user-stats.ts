import { AnalyticsEvent, UsageLog, connectDB } from "@aether/db";

export interface DailyUserStats {
  date: string;
  generations: number;
  exports: number;
  cost: number;
}

export interface TopAction {
  event: string;
  count: number;
}

export interface UserDashboardStats {
  totalAIGenerations: number;
  totalExports: number;
  totalCreditsUsed: number;
  totalCostUSD: number;
  last30Days: DailyUserStats[];
  topActions: TopAction[];
}

function createLast30DayBuckets(): DailyUserStats[] {
  const today = new Date();

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    return {
      date: date.toISOString().slice(0, 10),
      generations: 0,
      exports: 0,
      cost: 0,
    };
  });
}

const EMPTY_STATS: UserDashboardStats = {
  totalAIGenerations: 0,
  totalExports: 0,
  totalCreditsUsed: 0,
  totalCostUSD: 0,
  last30Days: createLast30DayBuckets(),
  topActions: [],
};

export async function getUserDashboardStats(userId: string, productId: string): Promise<UserDashboardStats> {
  try {
    await connectDB();

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [eventTotals, usageTotals, topActions, dailyEventRows, dailyCostRows] = await Promise.all([
      AnalyticsEvent.aggregate<{ totalAIGenerations: number; totalExports: number }>([
        {
          $match: {
            userId,
            productId,
          },
        },
        {
          $group: {
            _id: null,
            totalAIGenerations: {
              $sum: {
                $cond: [{ $eq: ["$event", "ai_generate_completed"] }, 1, 0],
              },
            },
            totalExports: {
              $sum: {
                $cond: [{ $regexMatch: { input: "$event", regex: "_exported$" } }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAIGenerations: 1,
            totalExports: 1,
          },
        },
      ]),
      UsageLog.aggregate<{ totalCreditsUsed: number; totalCostUSD: number }>([
        {
          $match: {
            productId,
            $expr: { $eq: [{ $toString: "$userId" }, userId] },
          },
        },
        {
          $group: {
            _id: null,
            totalCreditsUsed: { $sum: 1 },
            totalCostUSD: { $sum: "$cost" },
          },
        },
        {
          $project: {
            _id: 0,
            totalCreditsUsed: 1,
            totalCostUSD: 1,
          },
        },
      ]),
      AnalyticsEvent.aggregate<TopAction>([
        {
          $match: {
            userId,
            productId,
            createdAt: { $gte: thisMonthStart },
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
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      AnalyticsEvent.aggregate<{ date: string; generations: number; exports: number }>([
        {
          $match: {
            userId,
            productId,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            generations: {
              $sum: {
                $cond: [{ $eq: ["$event", "ai_generate_completed"] }, 1, 0],
              },
            },
            exports: {
              $sum: {
                $cond: [{ $regexMatch: { input: "$event", regex: "_exported$" } }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            generations: 1,
            exports: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
      UsageLog.aggregate<{ date: string; cost: number }>([
        {
          $match: {
            productId,
            $expr: { $eq: [{ $toString: "$userId" }, userId] },
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            cost: { $sum: "$cost" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            cost: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

    const dayMap = new Map<string, DailyUserStats>(
      createLast30DayBuckets().map((entry) => [entry.date, entry]),
    );

    for (const row of dailyEventRows) {
      const day = dayMap.get(row.date);
      if (!day) {
        continue;
      }

      day.generations = row.generations;
      day.exports = row.exports;
    }

    for (const row of dailyCostRows) {
      const day = dayMap.get(row.date);
      if (!day) {
        continue;
      }

      day.cost = Number(row.cost.toFixed(6));
    }

    return {
      totalAIGenerations: eventTotals[0]?.totalAIGenerations ?? 0,
      totalExports: eventTotals[0]?.totalExports ?? 0,
      totalCreditsUsed: usageTotals[0]?.totalCreditsUsed ?? 0,
      totalCostUSD: Number((usageTotals[0]?.totalCostUSD ?? 0).toFixed(6)),
      last30Days: Array.from(dayMap.values()),
      topActions,
    };
  } catch (error: unknown) {
    console.warn("[analytics] Failed to build user dashboard stats", error);
    return {
      ...EMPTY_STATS,
      last30Days: createLast30DayBuckets(),
    };
  }
}
