"use client";

import { Card } from "@aether/ui";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DailyActiveUsersPoint {
  date: string;
  count: number;
}

export function DailyActiveUsersChart({ data }: { data: DailyActiveUsersPoint[] }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Daily Active Users (30 days)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
