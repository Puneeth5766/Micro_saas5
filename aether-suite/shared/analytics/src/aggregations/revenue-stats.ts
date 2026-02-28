import { AnalyticsEvent, connectDB } from "@aether/db";

export type DateRange = {
  from: Date;
  to: Date;
};

export interface RevenueByProduct {
  productId: string;
  revenue: number;
}

export interface RevenueByPlan {
  plan: string;
  revenue: number;
  count: number;
}

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
}

export interface TopCustomer {
  userId: string;
  totalSpend: number;
  plan: string;
}

export interface RevenueStats {
  totalRevenue: number;
  mrr: number;
  revenueByProduct: RevenueByProduct[];
  revenueByPlan: RevenueByPlan[];
  dailyRevenue: DailyRevenuePoint[];
  topCustomers: TopCustomer[];
}

function createDailyRevenueBuckets(endDate: Date): DailyRevenuePoint[] {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(endDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    return {
      date: date.toISOString().slice(0, 10),
      revenue: 0,
    };
  });
}

function hashUserId(userId: string): string {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function emptyRevenueStats(endDate: Date): RevenueStats {
  return {
    totalRevenue: 0,
    mrr: 0,
    revenueByProduct: [],
    revenueByPlan: [],
    dailyRevenue: createDailyRevenueBuckets(endDate),
    topCustomers: [],
  };
}

const CHECKOUT_EVENT = "checkout_completed";

export async function getRevenueStats(dateRange: DateRange): Promise<RevenueStats> {
  try {
    await connectDB();

    const [totalRows, revenueByProduct, revenueByPlan, dailyRows, topCustomerRows] = await Promise.all([
      AnalyticsEvent.aggregate<{ totalRevenue: number }>([
        {
          $match: {
            category: "billing",
            event: CHECKOUT_EVENT,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
          },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: "$properties.amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalRevenue: 1,
          },
        },
      ]),
      AnalyticsEvent.aggregate<RevenueByProduct>([
        {
          $match: {
            category: "billing",
            event: CHECKOUT_EVENT,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
          },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: "$properties.amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: "$productId",
            revenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            revenue: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      AnalyticsEvent.aggregate<RevenueByPlan>([
        {
          $match: {
            category: "billing",
            event: CHECKOUT_EVENT,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
          },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: "$properties.amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            plan: { $ifNull: ["$properties.plan", "unknown"] },
          },
        },
        {
          $group: {
            _id: "$plan",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            plan: "$_id",
            revenue: 1,
            count: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      AnalyticsEvent.aggregate<DailyRevenuePoint>([
        {
          $match: {
            category: "billing",
            event: CHECKOUT_EVENT,
            createdAt: {
              $gte: new Date(new Date(dateRange.to).setDate(new Date(dateRange.to).getDate() - 29)),
              $lte: dateRange.to,
            },
          },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: "$properties.amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
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
            revenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            revenue: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
      AnalyticsEvent.aggregate<{ userId: string; totalSpend: number; plan: string }>([
        {
          $match: {
            category: "billing",
            event: CHECKOUT_EVENT,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to },
            userId: { $exists: true, $ne: "" },
          },
        },
        {
          $addFields: {
            amount: {
              $convert: {
                input: "$properties.amount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            plan: { $ifNull: ["$properties.plan", "unknown"] },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$userId",
            totalSpend: { $sum: "$amount" },
            plan: { $first: "$plan" },
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            totalSpend: 1,
            plan: 1,
          },
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const dayMap = new Map<string, DailyRevenuePoint>(
      createDailyRevenueBuckets(dateRange.to).map((entry) => [entry.date, entry]),
    );

    for (const row of dailyRows) {
      const bucket = dayMap.get(row.date);
      if (!bucket) {
        continue;
      }

      bucket.revenue = Number(row.revenue.toFixed(2));
    }

    const totalRevenue = Number((totalRows[0]?.totalRevenue ?? 0).toFixed(2));

    return {
      totalRevenue,
      mrr: totalRevenue,
      revenueByProduct: revenueByProduct.map((entry: RevenueByProduct) => ({
        productId: entry.productId,
        revenue: Number(entry.revenue.toFixed(2)),
      })),
      revenueByPlan: revenueByPlan.map((entry: RevenueByPlan) => ({
        plan: String(entry.plan),
        revenue: Number(entry.revenue.toFixed(2)),
        count: entry.count,
      })),
      dailyRevenue: Array.from(dayMap.values()),
      topCustomers: topCustomerRows.map((entry: { userId: string; totalSpend: number; plan: string }) => ({
        userId: hashUserId(entry.userId),
        totalSpend: Number(entry.totalSpend.toFixed(2)),
        plan: String(entry.plan),
      })),
    };
  } catch (error: unknown) {
    console.warn("[analytics] Failed to build revenue stats", error);
    return emptyRevenueStats(dateRange.to);
  }
}
