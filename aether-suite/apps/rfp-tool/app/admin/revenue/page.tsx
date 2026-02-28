import { getProductStats, getRevenueStats } from "@aether/analytics";
import { Card, StatCard } from "@aether/ui";
import { RevenueByProductChart } from "../_components/RevenueByProductChart";
import { RevenueChart } from "../_components/RevenueChart";

export default async function AdminRevenuePage() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 29);

  const [revenueStats, productStats] = await Promise.all([
    getRevenueStats({ from, to }),
    getProductStats("rfp-tool", { from, to }),
  ]);

  const avgRevenuePerUser = productStats.totalUsers > 0 ? revenueStats.totalRevenue / productStats.totalUsers : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Revenue</h1>
        <p className="text-sm text-text-secondary">Revenue trends and plan-level breakdown.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Revenue" value={`$${revenueStats.totalRevenue.toFixed(2)}`} />
        <StatCard label="MRR" value={`$${revenueStats.mrr.toFixed(2)}`} />
        <StatCard label="Avg Revenue Per User" value={`$${avgRevenuePerUser.toFixed(2)}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RevenueByProductChart data={revenueStats.revenueByProduct} />
        <RevenueChart data={revenueStats.dailyRevenue} title="Daily Revenue" />
      </div>

      <Card border className="p-5">
        <h3 className="mb-4 text-base font-semibold text-text-primary">Revenue by Plan</h3>
        <div className="space-y-2 text-sm text-text-secondary">
          {revenueStats.revenueByPlan.map((entry) => (
            <div key={entry.plan} className="flex items-center justify-between rounded border border-border px-3 py-2">
              <span className="font-medium text-text-primary">{entry.plan}</span>
              <span>
                ${entry.revenue.toFixed(2)} ({entry.count} checkouts)
              </span>
            </div>
          ))}
          {revenueStats.revenueByPlan.length === 0 ? <p>No billing revenue events in selected range.</p> : null}
        </div>
      </Card>
    </div>
  );
}
