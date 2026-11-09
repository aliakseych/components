import { Store } from "lucide-react";
import { pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

export function ParamsChips({ deal }: { deal: DealDetail }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm text-muted-foreground">
      <Store className="size-4" />
      Взнос бизнеса {pct(deal.down_payment_pct, 0)}
    </span>
  );
}
