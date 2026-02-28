"use client";

import { Card } from "@aether/ui";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ActivityPoint {
  date: string;
  generations: number;
  exports: number;
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Activity (last 30 days)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="generations"
              name="Generations"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="exports"
              name="Exports"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
