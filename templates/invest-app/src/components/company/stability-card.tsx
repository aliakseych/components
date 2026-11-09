import { Check, X } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { Ring } from "@/components/viz/ring";
import type { Company } from "@/lib/types";

const LEVEL = {
  good: { label: "Стабильная", color: "text-gain" },
  ok: { label: "Средне", color: "text-accent-foreground" },
  risk: { label: "Рискованная", color: "text-red-700" },
};

export function StabilityCard({ company }: { company: Company }) {
  const { stability } = company;
  const level = LEVEL[stability.level];
  return (
    <GlassCard className="space-y-5">
      <h2 className="text-lg font-semibold">Стабильность компании</h2>
      <div className="flex items-center gap-5">
        <Ring value={stability.score} size={112} stroke={10} className={level.color}>
          <span className="text-3xl font-semibold tabular">{stability.score}</span>
          <span className="text-xs text-muted-foreground">из 100</span>
        </Ring>
        <p className={`text-xl font-semibold ${level.color}`}>{level.label}</p>
      </div>
      <ul className="space-y-4">
        {stability.factors.map((factor, i) => {
          const Icon = factor.ok ? Check : X;
          return (
            <li key={`${factor.label}-${i}`} className="flex gap-3">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${factor.ok ? "bg-lime text-lime-foreground" : "bg-red-100 text-red-700"}`}><Icon className="size-4" /></span>
              <div><p className="font-medium">{factor.label}</p><p className="text-sm text-muted-foreground">{factor.text}</p></div>
            </li>
          );
        })}
      </ul>
      <AskAiButton company_id={company.id} title={company.name} block="Стабильность" question="Почему у этой компании такая оценка стабильности?" label="Почему такая оценка?" className="min-h-11" />
    </GlassCard>
  );
}
