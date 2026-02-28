import { Badge } from "../Badge";

export type BillingPlan = "free" | "pro" | "pay_per_use";

export interface PlanBadgeProps {
  plan: BillingPlan;
  size?: "sm" | "md";
}

const planLabel: Record<BillingPlan, string> = {
  free: "Free",
  pro: "Pro",
  pay_per_use: "Pay-per-use"
};

const planVariant: Record<BillingPlan, "default" | "info" | "success"> = {
  free: "default",
  pro: "info",
  pay_per_use: "success"
};

export function PlanBadge({ plan, size = "md" }: PlanBadgeProps) {
  return (
    <Badge variant={planVariant[plan]} size={size}>
      {planLabel[plan]}
    </Badge>
  );
}
