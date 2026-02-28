"use client";

import { Card } from "@aether/ui";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface ProviderBreakdownItem {
  provider: string;
  count: number;
  cost: number;
}

const COLORS = ["var(--color-primary)", "var(--color-secondary)", "var(--color-success)"];

export function AIProviderBreakdown({ data }: { data: ProviderBreakdownItem[] }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">AI Provider Split</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="provider" cx="50%" cy="50%" outerRadius={110} label>
              {data.map((entry, index) => (
                <Cell key={`${entry.provider}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
