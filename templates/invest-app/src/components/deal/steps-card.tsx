import { Check, Coins, Gavel, Wallet, Warehouse } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import type { DealDetail } from "@/lib/types";

const steps = [
  { label: "Вы вкладываете", icon: Wallet },
  { label: "Покупаем товар на бирже", icon: Gavel },
  { label: "Товар на складе", icon: Warehouse },
  { label: "Выплаты каждые 15 дней", icon: Coins },
];

export function StepsCard({ deal }: { deal: DealDetail }) {
  const current = deal.status === "completed" ? 4 : deal.status === "active" ? (deal.installments.some((i) => i.paid_at) ? 3 : 2) : 0;
  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Как это работает</h2><AskAiButton question="Что будет, если бизнес не заплатит?" deal_id={deal.id} title={deal.title} block="Как это работает" /></div>
      <div>
        {steps.map(({ label, icon: Icon }, i) => (
          <div key={label} className="relative flex items-center gap-3 pb-4 last:pb-0">
            {i < 3 && <span className="absolute left-5 top-10 h-4 w-px bg-border" />}
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${i <= current ? "bg-lime text-lime-foreground" : "bg-secondary text-muted-foreground"}`}>
              {i < current ? <Check className="size-5" /> : <Icon className="size-5" />}
            </span>
            <span className={i === current ? "font-semibold" : "text-muted-foreground"}>{label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
