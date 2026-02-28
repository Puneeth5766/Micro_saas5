"use client";

import type { UserDashboardStats } from "@aether/analytics";
import { Badge, Card, StatCard, Tabs, UsageMeter } from "@aether/ui";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivityChart } from "./ActivityChart";

export interface ProviderUsageStat {
  provider: "openai" | "gemini" | "claude";
  count: number;
  cost: number;
  tokens: number;
}

interface UserAnalyticsDashboardProps {
  stats: UserDashboardStats;
  plan: "free" | "pro" | "cancelled";
  providerUsage: ProviderUsageStat[];
}

function monthStartIso(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start.toISOString().slice(0, 10);
}

function getIntensityClass(value: number): string {
  if (value <= 0) return "bg-surface-alt";
  if (value <= 1) return "bg-primary/25";
  if (value <= 3) return "bg-primary/45";
  if (value <= 6) return "bg-primary/65";
  return "bg-primary";
}

function ActivityHeatmap({ stats }: { stats: UserDashboardStats }) {
  const recent = stats.last30Days.slice(-28);
  const padded = [...Array(Math.max(0, 28 - recent.length)).fill(null), ...recent];

  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Activity Heatmap (4 weeks)</h3>
      <div className="grid grid-cols-7 gap-2">
        {padded.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-9 rounded-md bg-surface-alt" />;
          }

          const count = day.generations + day.exports;
          return (
            <div
              key={day.date}
              className={`h-9 rounded-md ${getIntensityClass(count)} transition-colors`}
              title={`${day.date}: ${count} actions`}
            />
          );
        })}
      </div>
    </Card>
  );
}

function CostBreakdownChart({ data }: { data: UserDashboardStats["last30Days"] }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Daily Cost (last 30 days)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="costArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="cost" stroke="var(--color-warning)" fill="url(#costArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const providerLabel: Record<ProviderUsageStat["provider"], string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
};

export function UserAnalyticsDashboard({ stats, plan, providerUsage }: UserAnalyticsDashboardProps) {
  const currentMonthStart = monthStartIso();
  const thisMonthRows = stats.last30Days.filter((day) => day.date >= currentMonthStart);
  const thisMonthGenerations = thisMonthRows.reduce((sum, day) => sum + day.generations, 0);
  const thisMonthCost = thisMonthRows.reduce((sum, day) => sum + day.cost, 0);

  const monthlyLimit = plan === "pro" ? Number.POSITIVE_INFINITY : 3;
  const usedThisMonth = thisMonthGenerations;

  const avgCostPerGeneration = stats.totalAIGenerations > 0 ? stats.totalCostUSD / stats.totalAIGenerations : 0;

  const sortedProviders = [...providerUsage].sort((a, b) => b.count - a.count);
  const mostUsedProvider = sortedProviders[0]?.provider ? providerLabel[sortedProviders[0].provider] : "N/A";

  const totalProviderCost = providerUsage.reduce((sum, item) => sum + item.cost, 0);
  const totalProviderTokens = providerUsage.reduce((sum, item) => sum + item.tokens, 0);
  const blendedCurrent = totalProviderTokens > 0 ? totalProviderCost / totalProviderTokens : 0;
  const geminiBenchmark = 0.00000035;
  const savingsPercent = blendedCurrent > 0
    ? Math.max(0, Math.min(95, ((blendedCurrent - geminiBenchmark) / blendedCurrent) * 100))
    : 0;

  const topActions = stats.topActions;

  const tabs = [
    {
      label: "Overview",
      value: "overview",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Generations" value={stats.totalAIGenerations} />
            <StatCard label="Total Exports" value={stats.totalExports} />
            <StatCard label="Credits Used" value={stats.totalCreditsUsed} />
            <StatCard label="Total Cost" value={`$${stats.totalCostUSD.toFixed(4)}`} />
          </div>

          <UsageMeter
            productId="rfp-tool"
            used={usedThisMonth}
            limit={Number.isFinite(monthlyLimit) ? monthlyLimit : 9999}
            plan={plan === "pro" ? "pro" : "free"}
          />

          <ActivityChart data={stats.last30Days} />
        </div>
      ),
    },
    {
      label: "Activity",
      value: "activity",
      content: (
        <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
          <ActivityHeatmap stats={stats} />

          <Card border className="p-5">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Top Actions (this month)</h3>
            <ol className="space-y-2">
              {topActions.map((action, index) => (
                <li key={action.event} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm text-text-primary">
                    {index + 1}. {action.event}
                  </span>
                  <Badge size="sm" variant="info">
                    {action.count}
                  </Badge>
                </li>
              ))}
              {topActions.length === 0 ? <p className="text-sm text-text-secondary">No actions yet this month.</p> : null}
            </ol>
          </Card>
        </div>
      ),
    },
    {
      label: "Cost",
      value: "cost",
      content: (
        <div className="space-y-6">
          <CostBreakdownChart data={stats.last30Days} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="This Month Cost" value={`$${thisMonthCost.toFixed(4)}`} />
            <StatCard label="Avg Cost / Generation" value={`$${avgCostPerGeneration.toFixed(6)}`} />
            <StatCard label="Most Used Provider" value={mostUsedProvider} />
          </div>

          <Card border className="p-4">
            <p className="text-sm text-text-secondary">
              Cost efficiency tip: Switch to Gemini Flash to reduce cost by approximately {savingsPercent.toFixed(1)}%.
            </p>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Usage Analytics</h1>
        <p className="text-sm text-text-secondary">Your personal activity, usage, and cost insights.</p>
      </header>

      <Tabs items={tabs} defaultValue="overview" variant="underline" />
    </section>
  );
}
