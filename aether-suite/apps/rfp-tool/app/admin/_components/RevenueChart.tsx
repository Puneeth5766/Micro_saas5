"use client";

import { Card } from "@aether/ui";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export function RevenueChart({ data, title = "Revenue (30 days)" }: { data: RevenuePoint[]; title?: string }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-secondary)" fill="url(#revenueColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
