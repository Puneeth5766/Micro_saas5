"use client";

import { Card } from "@aether/ui";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface RevenueByProductItem {
  productId: string;
  revenue: number;
}

export function RevenueByProductChart({ data }: { data: RevenueByProductItem[] }) {
  return (
    <Card border className="p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Revenue by Product</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="productId" stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
