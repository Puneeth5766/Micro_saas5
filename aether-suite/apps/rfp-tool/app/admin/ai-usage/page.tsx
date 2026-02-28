import { AnalyticsEvent, UsageLog, connectDB } from "@aether/db";
import { Card, StatCard } from "@aether/ui";
import { UsageLogsTable, type UsageLogRow } from "../_components/UsageLogsTable";

function hashUserId(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export default async function AdminAiUsagePage() {
  await connectDB();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [recentLogs, todayTotals, errorRows] = await Promise.all([
    UsageLog.find({ productId: "rfp-tool" })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(),
    UsageLog.aggregate<{ tokens: number; cost: number }>([
      { $match: { productId: "rfp-tool", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, tokens: { $sum: "$tokensUsed" }, cost: { $sum: "$cost" } } },
      { $project: { _id: 0, tokens: 1, cost: 1 } },
    ]),
    AnalyticsEvent.aggregate<{ event: string; count: number }>([
      { $match: { productId: "rfp-tool", event: { $in: ["ai_generate_started", "ai_generate_failed"] } } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $project: { _id: 0, event: "$_id", count: 1 } },
    ]),
  ]);

  const started = errorRows.find((row) => row.event === "ai_generate_started")?.count ?? 0;
  const failed = errorRows.find((row) => row.event === "ai_generate_failed")?.count ?? 0;
  const errorRate = started > 0 ? (failed / started) * 100 : 0;

  const rows: UsageLogRow[] = recentLogs.map((log) => ({
    userId: hashUserId(String(log.userId)),
    productId: log.productId,
    provider: log.provider,
    tokensUsed: log.tokensUsed,
    cost: Number(log.cost.toFixed(6)),
    action: log.action,
    timestamp: new Date(log.createdAt).toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">AI Usage</h1>
        <p className="text-sm text-text-secondary">Detailed AI usage logs for the latest 500 events.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today's Tokens" value={todayTotals[0]?.tokens ?? 0} />
        <StatCard label="Today's Cost" value={`$${(todayTotals[0]?.cost ?? 0).toFixed(4)}`} />
        <StatCard label="Error Rate" value={`${errorRate.toFixed(2)}%`} />
      </div>

      <Card border className="p-5">
        <UsageLogsTable rows={rows} />
      </Card>
    </div>
  );
}
