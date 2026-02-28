import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";

export interface CreditPack {
  id: string;
  productId: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

export interface CreditPackCardProps {
  pack: CreditPack;
  onBuy: (pack: CreditPack) => void;
  loading?: boolean;
}

export function CreditPackCard({ pack, onBuy, loading = false }: CreditPackCardProps) {
  const isBestValue = pack.credits >= 15 && pack.credits < 30;

  return (
    <Card border className="relative flex h-full flex-col gap-3 p-4">
      {isBestValue ? (
        <div className="absolute right-3 top-3">
          <Badge variant="info" size="sm">
            Best Value
          </Badge>
        </div>
      ) : null}

      <p className="text-sm text-text-secondary">{pack.productId}</p>
      <p className="text-3xl font-semibold text-text-primary">{pack.credits}</p>
      <p className="text-sm text-text-secondary">credits</p>
      <p className="text-xl font-semibold text-text-primary">${pack.price.toFixed(2)}</p>

      <ul className="list-disc space-y-1 pl-4 text-sm text-text-secondary">
        <li>One-time purchase</li>
        <li>Instant credit delivery</li>
        <li>No subscription required</li>
      </ul>

      <Button className="mt-auto w-full" loading={loading} onClick={() => onBuy(pack)}>
        Buy Now
      </Button>
    </Card>
  );
}
