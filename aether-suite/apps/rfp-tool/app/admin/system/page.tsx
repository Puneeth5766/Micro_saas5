import { getSystemStats } from "@aether/analytics";
import { StatCard } from "@aether/ui";

export default async function AdminSystemPage() {
  const stats = await getSystemStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">System</h1>
        <p className="text-sm text-text-secondary">Global system metrics across the suite.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Tokens Used" value={stats.totalTokensUsed} />
        <StatCard label="Total Cost (USD)" value={`$${stats.totalCostUSD.toFixed(4)}`} />
        <StatCard label="Error Rate" value={`${stats.errorRate.toFixed(2)}%`} />
      </div>
    </div>
  );
}
