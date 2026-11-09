import { AlertTriangle, Check, Sparkles } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { DealAiSkeleton } from "@/components/ai/ai-skeletons";
import { GlassCard } from "@/components/viz/glass-card";
import { useApi } from "@/lib/use-api";
import type { DealAi } from "@/lib/types";

const fits = {
  good: { label: "Подходит вам", className: "bg-lime text-lime-foreground" },
  ok: { label: "Можно", className: "bg-accent text-accent-foreground" },
  poor: { label: "Не под ваш профиль", className: "bg-muted text-muted-foreground" },
};

export function DealAiCard({ id }: { id: number | string; authenticated?: boolean }) {
  const { data: opinion, status } = useApi<DealAi>(`/ai/deal/${id}/`, { defer: true });
  if (status === "loading") return <DealAiSkeleton />;
  if (!opinion) return null;
  const fit = opinion.fit ? fits[opinion.fit] : null;

  return (
    <GlassCard className="rise space-y-4 bg-accent/40">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5" /> Мнение ИИ</h2>
      <p className="text-sm leading-relaxed">{opinion.summary}</p>
      {fit && <div className="space-y-2"><span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${fit.className}`}>{fit.label}</span>{opinion.fit_text && <p className="text-sm text-muted-foreground">{opinion.fit_text}</p>}</div>}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0 space-y-2">{opinion.pros.map((pro, index) => <div key={`${pro}-${index}`} className="flex items-start gap-2 rounded-2xl bg-lime p-3 text-lime-foreground"><Check className="size-4 shrink-0" /><span className="min-w-0 break-words">{pro}</span></div>)}</div>
        <div className="min-w-0 space-y-2">{opinion.risks.map((risk, index) => <div key={`${risk}-${index}`} className="flex items-start gap-2 rounded-2xl bg-muted p-3"><AlertTriangle className="size-4 shrink-0" /><span className="min-w-0 break-words">{risk}</span></div>)}</div>
      </div>
      <div className="flex justify-end"><AskAiButton question="Расскажи подробнее" deal_id={Number(id)} block="ИИ-аналитика сделки" /></div>
    </GlassCard>
  );
}
