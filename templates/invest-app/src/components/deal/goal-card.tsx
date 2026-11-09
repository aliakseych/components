import { Clock, Users } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { Ring } from "@/components/viz/ring";
import { days, mln, pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

export function GoalCard({ deal }: { deal: DealDetail }) {
  const paid = deal.installments.filter((i) => i.paid_at).length;
  const collecting = deal.status === "collecting";
  const amounts = [
    ["Цель", deal.investors_amount],
    ["Собрано", deal.collected_amount],
    ["Осталось", Math.max(0, Number(deal.investors_amount) - Number(deal.collected_amount))],
  ];
  return (
    <GlassCard className="flex flex-wrap items-center justify-around gap-5 p-5">
      <div className="flex w-full items-center justify-between gap-2"><h2 className="text-lg font-semibold">Сбор</h2><AskAiButton question="Успеет ли сбор?" deal_id={deal.id} title={deal.title} block="Сбор" /></div>
      <Ring value={collecting ? deal.collected_pct : paid * 25} size={168} stroke={14} className="text-gain">
        <span className="text-4xl font-semibold tabular">{collecting ? pct(deal.collected_pct, 0) : `${paid}/4`}</span>
        <span className="text-sm text-muted-foreground">{collecting ? "собрано" : "выплат"}</span>
      </Ring>
      <div className="min-w-32 flex-1 space-y-3">
        {amounts.map(([label, value]) => (
          <div key={label}>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold tabular">{mln(value)}</div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Users className="size-4" />
            {deal.investors_count}
          </span>
          {deal.days_left !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
              <Clock className="size-4" />
              {days(deal.days_left)}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
