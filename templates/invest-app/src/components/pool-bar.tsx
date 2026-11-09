import { Landmark, Store, Users } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { SegmentedBar } from "@/components/viz/segmented-bar";
import { mln } from "@/lib/format";

export function PoolBar({ deal_id, down_payment, investors_amount, bank_amount }: {
  deal_id: number;
  down_payment: string;
  down_payment_pct: string;
  investors_amount: string;
  bank_amount: string;
}) {
  const parts = [
    { label: "Бизнес", value: Number(down_payment), className: "bg-muted-foreground/30", icon: Store },
    { label: "Инвесторы", value: Number(investors_amount), className: "bg-lime", icon: Users },
    { label: "Банк", value: Number(bank_amount), className: "bg-accent", icon: Landmark },
  ];
  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Кто вносит</h2><AskAiButton question="Зачем банк и взнос?" deal_id={deal_id} block="Кто вносит" /></div>
      <SegmentedBar segments={parts} />
      <div className="space-y-3">
        {parts.map(({ label, value, className, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-full ${className}`}>
              <Icon className="size-5" />
            </span>
            <span className="flex-1">{label}</span>
            <span className="font-semibold tabular">{mln(value)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
