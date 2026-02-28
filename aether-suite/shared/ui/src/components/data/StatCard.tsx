import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Spinner } from "../Spinner";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaType?: "up" | "down";
  icon?: ReactNode;
  loading?: boolean;
}

export function StatCard({ label, value, delta, deltaType = "up", icon, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-alt" />
          <Spinner size="sm" color="muted" />
        </div>
        <div className="mt-4 h-8 w-32 animate-pulse rounded bg-surface-alt" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        {icon ? <span className="text-text-muted">{icon}</span> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
      {typeof delta === "number" ? (
        <p className={cn("mt-2 text-sm font-medium", deltaType === "up" ? "text-success" : "text-danger")}>
          {deltaType === "up" ? "▲" : "▼"} {Math.abs(delta)}%
        </p>
      ) : null}
    </div>
  );
}
