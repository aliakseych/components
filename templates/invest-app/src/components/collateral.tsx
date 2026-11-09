import { PriceChart } from "@/components/price-chart";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { money, pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

export function Collateral({ deal }: { deal: DealDetail }) {
  const up = deal.price_change_pct >= 0;
  const threshold = Number(deal.loss_threshold_pct);
  const margin = threshold > 0 ? Math.max(0, Math.min(100, deal.margin_left_pct / threshold * 100)) : 0;
  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Залог</h2><AskAiButton question="Что если цена упадёт?" deal_id={deal.id} title={deal.title} block="Залог" /></div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-3xl font-semibold tabular">{money(deal.current_price)}<span className="text-sm font-normal text-muted-foreground">/{deal.unit}</span></span>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${up ? "bg-lime text-lime-foreground" : "bg-destructive/10 text-destructive"}`}>
          {up ? "+" : ""}{pct(deal.price_change_pct, 2)}
        </span>
      </div>
      <PriceChart points={deal.price_history} thresholdPrice={Number(deal.exchange_price) * (1 - threshold / 100)} />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Запас до потерь</span>
          <span className="font-semibold tabular">{pct(deal.margin_left_pct, 1)} <span className="font-normal text-muted-foreground">из {pct(threshold, 1)}</span></span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-lime" style={{ width: `${margin}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
