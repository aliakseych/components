import Link from "next/link";
import { AlertTriangle, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import type { AiInsight } from "@/lib/types";
import { InsightsSkeleton } from "@/components/ai/ai-skeletons";
import { useApi } from "@/lib/use-api";

const tones = {
  good: { Icon: TrendingUp, className: "bg-lime text-lime-foreground" },
  info: { Icon: Lightbulb, className: "bg-accent text-accent-foreground" },
  warn: { Icon: AlertTriangle, className: "bg-[oklch(0.93_0.08_80)] text-foreground" },
};

export function InsightsCard() {
  const { data } = useApi<{ items: AiInsight[] }>("/ai/insights/", { auth: true, defer: true });
  if (!data) return <InsightsSkeleton />;
  const { items } = data;

  return (
    <GlassCard className="rise space-y-4 bg-accent/40">
      <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5" /> ИИ-аналитика</h2><AskAiButton question="Разбери мой портфель" block="ИИ-аналитика" /></div>
      <div className="stagger space-y-4">
        {items.map((item, index) => {
          const { Icon, className } = tones[item.tone];
          return (
            <div key={`${item.title}-${index}`} className="flex min-w-0 items-start gap-3">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="size-5" /></span>
              <div className="min-w-0 space-y-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
                {item.deal_id != null && <Link href={`/deals/${item.deal_id}`} className="inline-flex min-h-11 items-center rounded-full bg-card px-4 text-sm font-semibold">Смотреть сделку</Link>}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
