import { Button } from "../Button";
import { Card } from "../Card";
import { CreditPackCard, type CreditPack } from "./CreditPackCard";
import { PlanBadge, type BillingPlan } from "./PlanBadge";

export interface PricingTableProps {
  productId: string;
  currentPlan: BillingPlan;
  packs: CreditPack[];
  onSelectPlan: () => void;
  onBuyCredits: (pack: CreditPack) => void;
  loadingPlan?: boolean;
  loadingPackId?: string | null;
}

export function PricingTable({
  productId,
  currentPlan,
  packs,
  onSelectPlan,
  onBuyCredits,
  loadingPlan = false,
  loadingPackId = null
}: PricingTableProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card border className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Pro Subscription</h3>
          {currentPlan === "pro" ? <PlanBadge plan="pro" size="sm" /> : null}
        </div>
        <p className="text-3xl font-semibold text-text-primary">$29/mo</p>
        <ul className="list-disc space-y-1 pl-4 text-sm text-text-secondary">
          <li>Unlimited usage across all products</li>
          <li>Priority processing and support</li>
          <li>Best for heavy users</li>
        </ul>
        <Button onClick={onSelectPlan} loading={loadingPlan} disabled={currentPlan === "pro"}>
          {currentPlan === "pro" ? "Current Plan" : "Upgrade to Pro"}
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {packs
          .filter((pack) => pack.productId === productId)
          .map((pack) => (
            <CreditPackCard
              key={pack.id}
              pack={pack}
              onBuy={onBuyCredits}
              loading={loadingPackId === pack.id}
            />
          ))}
      </div>
    </div>
  );
}
