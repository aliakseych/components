import { MapPin, Package } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { SegmentedBar } from "@/components/viz/segmented-bar";
import { mln, money, plural, qty } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

const colors = ["bg-primary", "bg-lime", "bg-accent", "bg-muted-foreground/40"];

export function ItemsCard({ deal }: { deal: DealDetail }) {
  const warehouses = new Set(deal.items.map((item) => `${item.warehouse}|${item.warehouse_region}`));
  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Что покупаем</h2><AskAiButton question="Что это за товар?" deal_id={deal.id} title={deal.title} block="Что покупаем" /></div>
      {deal.items.length > 1 && (
        <SegmentedBar segments={deal.items.map((item, i) => ({
          label: `${i}-${item.commodity}`,
          value: Number(item.amount),
          className: colors[i % colors.length],
        }))} />
      )}
      <div className="space-y-4">
        {deal.items.map((item, i) => (
          <div key={`${item.commodity}-${i}`} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Package className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 font-medium">
                {deal.items.length > 1 && <span className={`mr-2 inline-block size-2 rounded-full ${colors[i % colors.length]}`} />}
                {item.commodity}
              </div>
              <div className="text-sm text-muted-foreground">
                {qty(item.quantity, item.unit)} × {money(item.price)}
              </div>
            </div>
            <span className="shrink-0 font-semibold tabular">{mln(item.amount)}</span>
          </div>
        ))}
      </div>
      {deal.items.length > 0 && (
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">
            {warehouses.size > 1 ? `${warehouses.size} ${plural(warehouses.size, ["склад", "склада", "складов"])}` : deal.items[0].warehouse}
          </span>
        </div>
      )}
      <div className="flex justify-between border-t pt-4">
        <span className="text-muted-foreground">Итого</span>
        <span className="text-xl font-semibold tabular">{mln(deal.goods_amount)}</span>
      </div>
    </GlassCard>
  );
}
