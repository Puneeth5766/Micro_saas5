import { AnalyticsEvent, connectDB } from "@aether/db";

export type DateRange = {
  from: Date;
  to: Date;
};

export interface DailyActiveUsersPoint {
  date: string;
  count: number;
}

export interface ProductStats {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  totalExports: number;
  avgGenerationsPerUser: number;
  dailyActiveUsers: DailyActiveUsersPoint[];
  conversionRate: number;
}

function createDailyActiveUserBuckets(endDate: Date): DailyActiveUsersPoint[] {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(endDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    };
  });
}

function emptyProductStats(endDate: Date): ProductStats {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalGenerations: 0,
    totalExports: 0,
    avgGenerationsPerUser: 0,
    dailyActiveUsers: createDailyActiveUserBuckets(endDate),
    conversionRate: 0,
  };
}

export async function getProductStats(productId: string, dateRange: DateRange): Promise<ProductStats> {
  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [totalsRows, activeRows, dailyRows, conversionRows] = await Promise.all([
      AnalyticsEvent.aggregate<{
        totalUsers: number;
        totalGenerations: number;
        totalExports: number;
      }>([
        {
          $match: {
            productId,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
            userId: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: null,
            users: { $addToSet: "$userId" },
            totalGenerations: {
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
            totalUsers: { $size: "$users" },
            totalGenerations: 1,
            totalExports: 1,
          },
        },
      ]),
      AnalyticsEvent.aggregate<{ activeUsers: number }>([
        {
          $match: {
            productId,
            createdAt: { $gte: sevenDaysAgo },
            userId: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$userId",
          },
        },
        {
          $group: {
            _id: null,
            activeUsers: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            activeUsers: 1,
          },
        },
      ]),
      AnalyticsEvent.aggregate<DailyActiveUsersPoint>([
        {
          $match: {
            productId,
            createdAt: {
              $gte: new Date(new Date(dateRange.to).setDate(new Date(dateRange.to).getDate() - 29)),
              $lte: dateRange.to,
            },
            userId: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              userId: "$userId",
            },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
      AnalyticsEvent.aggregate<{ totalUsers: number; convertedUsers: number }>([
        {
          $match: {
            productId,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
            userId: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$userId",
            hasBillingEvent: {
              $max: {
                $cond: [{ $eq: ["$category", "billing"] }, 1, 0],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            convertedUsers: { $sum: "$hasBillingEvent" },
          },
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            convertedUsers: 1,
          },
        },
      ]),
    ]);

    const totals = totalsRows[0];
    const conversion = conversionRows[0];

    const bucketMap = new Map<string, DailyActiveUsersPoint>(
      createDailyActiveUserBuckets(dateRange.to).map((entry) => [entry.date, entry]),
    );

    for (const row of dailyRows) {
      const bucket = bucketMap.get(row.date);
      if (!bucket) {
        continue;
      }

      bucket.count = row.count;
    }

    const totalUsers = totals?.totalUsers ?? 0;
    const totalGenerations = totals?.totalGenerations ?? 0;

    return {
      totalUsers,
      activeUsers: activeRows[0]?.activeUsers ?? 0,
      totalGenerations,
      totalExports: totals?.totalExports ?? 0,
      avgGenerationsPerUser: totalUsers > 0 ? Number((totalGenerations / totalUsers).toFixed(4)) : 0,
      dailyActiveUsers: Array.from(bucketMap.values()),
      conversionRate:
        (conversion?.totalUsers ?? 0) > 0
          ? Number((((conversion?.convertedUsers ?? 0) / (conversion?.totalUsers ?? 1)) * 100).toFixed(2))
          : 0,
    };
  } catch (error: unknown) {
    console.warn("[analytics] Failed to build product stats", error);
    return emptyProductStats(dateRange.to);
  }
}
