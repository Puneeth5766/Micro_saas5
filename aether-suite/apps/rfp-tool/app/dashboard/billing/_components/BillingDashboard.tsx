"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, ProgressBar, StatCard, toast } from "@aether/ui";
import { PLANS } from "@aether/billing";
import type { SubscriptionStatus } from "@aether/db";

type ProductUsage = {
  productId: string;
  usageCount: number;
  lastUsed: Date;
};

type BillingDashboardProps = {
  user: {
    id: string;
    email: string;
    name: string;
    subscriptionStatus: SubscriptionStatus;
    usageCredits: number;
    products: ProductUsage[];
  };
  productId: "rfp-tool";
};

const productLabel = {
  "rfp-tool": "Documents"
} as const;

export function BillingDashboard({ user, productId }: BillingDashboardProps) {
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  const currentUsage = user.products.find((entry) => entry.productId === productId)?.usageCount ?? 0;

  const plan = user.subscriptionStatus === "pro" ? "pro" : user.subscriptionStatus === "pay_per_use" ? "pay_per_use" : "free";

  const usagePercent = useMemo(() => {
    if (plan === "pro") {
      return 0;
    }

    const limit = PLANS.FREE.limits[productId];
    return Math.min(100, Math.round((currentUsage / Math.max(limit, 1)) * 100));
  }, [currentUsage, plan, productId]);

  async function redirectToCheckout(payload: { type: "subscription"; priceId: string } | { type: "credit_pack"; packId: string }) {
    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !json.url) {
      throw new Error(json.error ?? "Unable to create checkout session.");
    }

    window.location.href = json.url;
  }

  async function onUpgrade(): Promise<void> {
    setLoadingSubscription(true);
    try {
      await redirectToCheckout({ type: "subscription", priceId: PLANS.PRO.stripePriceId });
      toast.success("Redirecting to Stripe checkout...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start subscription checkout.");
    } finally {
      setLoadingSubscription(false);
    }
  }

  async function onManageSubscription(): Promise<void> {
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const json = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Unable to open billing portal.");
      }

      toast.success("Opening billing portal...");
      window.location.href = json.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal.");
    } finally {
      setLoadingPortal(false);
    }
  }

  async function onBuyPack(packId: string): Promise<void> {
    setLoadingPackId(packId);
    try {
      await redirectToCheckout({ type: "credit_pack", packId });
      toast.success("Redirecting to Stripe checkout...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start credit pack checkout.");
    } finally {
      setLoadingPackId(null);
    }
  }

  const planBadge = plan === "pro" ? "Pro" : plan === "pay_per_use" ? "Pay-per-use" : "Free";

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Billing</h1>
        <p className="text-sm text-text-secondary">Manage subscription, credits, and product usage.</p>
      </header>

      <Card border padding="lg" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Current Plan</h2>
            <p className="text-sm text-text-secondary">Plan status and current product usage.</p>
          </div>
          <Badge variant={plan === "pro" ? "success" : plan === "pay_per_use" ? "info" : "warning"}>{planBadge}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Credits" value={user.usageCredits} />
          <Card border className="p-4">
            <p className="mb-3 text-sm text-text-secondary">{productLabel[productId]} usage</p>
            <ProgressBar
              value={usagePercent}
              label={
                plan === "pro"
                  ? "Unlimited"
                  : `${currentUsage}/${PLANS.FREE.limits[productId]} ${productLabel[productId].toLowerCase()}`
              }
              color={plan === "pro" ? "success" : "primary"}
            />
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          {plan !== "pro" ? (
            <Button onClick={onUpgrade} loading={loadingSubscription}>Upgrade to Pro</Button>
          ) : null}

          {plan === "pro" ? (
            <Button variant="outline" onClick={onManageSubscription} loading={loadingPortal}>
              Manage Subscription
            </Button>
          ) : null}
        </div>
      </Card>

      {plan !== "pro" ? (
        <Card border padding="lg" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Credit Packs</h2>
            <p className="text-sm text-text-secondary">Buy extra credits for on-demand document generation.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.PAY_PER_USE[productId].map((pack) => (
              <Card key={pack.id} border className="space-y-3 p-4">
                <p className="text-lg font-semibold text-text-primary">{pack.credits} credits</p>
                <p className="text-sm text-text-secondary">${pack.price.toFixed(2)} one-time</p>
                <Button
                  className="w-full"
                  onClick={() => void onBuyPack(pack.id)}
                  loading={loadingPackId === pack.id}
                >
                  Buy Now
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
