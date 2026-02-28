"use client";

import { useState } from "react";
import { Alert } from "../Alert";
import { Button } from "../Button";

export interface UpgradePromptProps {
  productId: string;
  reason: "limit_reached" | "feature_locked";
  onBuyCredits?: () => void;
  onUpgradeToPro?: () => void;
}

export function UpgradePrompt({ productId, reason, onBuyCredits, onUpgradeToPro }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const description =
    reason === "limit_reached"
      ? `You reached your ${productId} usage limit. Buy credits or upgrade for uninterrupted access.`
      : `This ${productId} feature is available on paid plans. Buy credits or upgrade to Pro.`;

  return (
    <Alert variant="warning" title="Upgrade recommended" description={description}>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onBuyCredits}>
          Buy Credits
        </Button>
        <Button size="sm" onClick={onUpgradeToPro}>
          Upgrade to Pro
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </div>
    </Alert>
  );
}
