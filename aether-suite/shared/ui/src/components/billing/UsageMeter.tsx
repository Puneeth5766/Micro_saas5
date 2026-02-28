import { Alert } from "../Alert";
import { ProgressBar } from "../data/ProgressBar";
import type { BillingPlan } from "./PlanBadge";

export interface UsageMeterProps {
  productId: string;
  used: number;
  limit: number;
  plan: BillingPlan;
}

export function UsageMeter({ productId, used, limit, plan }: UsageMeterProps) {
  if (plan === "pro") {
    return (
      <div className="rounded-md border border-border bg-surface p-4">
        <p className="text-sm text-text-secondary">{productId}</p>
        <p className="mt-1 text-sm font-medium text-success">Unlimited</p>
      </div>
    );
  }

  const safeLimit = Math.max(1, limit);
  const percent = Math.min(100, Math.round((Math.max(used, 0) / safeLimit) * 100));
  const remaining = Math.max(limit - used, 0);
  const color = percent > 85 ? "danger" : percent >= 60 ? "warning" : "success";

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <ProgressBar value={percent} color={color} label={`${used} / ${limit} used`} />
      {remaining <= 3 ? (
        <Alert
          variant="warning"
          title="Low remaining usage"
          description={`You have ${remaining} uses left for ${productId}.`}
        />
      ) : null}
    </div>
  );
}
