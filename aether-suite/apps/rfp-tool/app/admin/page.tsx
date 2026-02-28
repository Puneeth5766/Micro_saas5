import { getProductStats, getRevenueStats, getSystemStats } from "@aether/analytics";
import { StatCard } from "@aether/ui";
import { AIProviderBreakdown } from "./_components/AIProviderBreakdown";
import { DailyActiveUsersChart } from "./_components/DailyActiveUsersChart";
import { RevenueChart } from "./_components/RevenueChart";

export default async function AdminOverviewPage() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 29);

  const [systemStats, productStats, revenueStats] = await Promise.all([
    getSystemStats(),
    getProductStats("rfp-tool", { from, to }),
    getRevenueStats({ from, to }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Overview</h1>
        <p className="text-sm text-text-secondary">Operational and revenue health for the RFP tool.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={systemStats.totalUsers} />
        <StatCard label="Today's New Users" value={systemStats.newUsersToday} />
        <StatCard label="Total AI Requests" value={systemStats.totalAIRequests} />
        <StatCard label="Total Revenue" value={`$${revenueStats.totalRevenue.toFixed(2)}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DailyActiveUsersChart data={productStats.dailyActiveUsers} />
        <RevenueChart data={revenueStats.dailyRevenue} />
      </div>

      <AIProviderBreakdown data={systemStats.aiRequestsByProvider} />
    </div>
  );
}
