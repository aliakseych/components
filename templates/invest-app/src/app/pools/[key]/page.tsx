import { Suspense } from "react";
import { notFound, useParams } from "next/navigation";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { DealCard } from "@/components/deal-card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/viz/glass-card";
import { Ring } from "@/components/viz/ring";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import { CATEGORY_ICON, CATEGORY_TONE, pct } from "@/lib/format";
import type { DealSummary, Pool } from "@/lib/types";

export default function PoolPage() {
  return <main className="space-y-5 p-4 pb-32"><PageHeader back="/" /><Suspense fallback={<div className="space-y-4"><Skeleton className="h-64 rounded-[28px]" /><Skeleton className="h-40 rounded-[28px]" /><Skeleton className="h-40 rounded-[28px]" /></div>}><PoolContent /></Suspense></main>;
}

function PoolContent() {
  const { key } = useParams<{ key: string }>();
  const pools = useApi<{ items: Pool[] }>("/pools/").data?.items;
  const pool = pools?.find((item) => item.key === key);
  const deals = useApi<{ items: DealSummary[] }>(pool ? `/deals/?category=${encodeURIComponent(key)}` : null).data?.items;
  useTitle(pool?.title ?? "Пул");
  if (pools && !pool) notFound();
  if (!pool || !deals) return <div className="space-y-4"><Skeleton className="h-64 rounded-[28px]" /><Skeleton className="h-40 rounded-[28px]" /><Skeleton className="h-40 rounded-[28px]" /></div>;
  const Icon = CATEGORY_ICON[pool.key];
  const tone = CATEGORY_TONE[pool.key];
  const progress = Number(pool.target_total) > 0 ? Number(pool.collected_total) / Number(pool.target_total) * 100 : 0;
  return <>
    <div className="space-y-3"><div className="flex items-start justify-between gap-2"><span className={`flex size-20 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-9" /></span><AskAiButton question={`Стоит ли вкладывать в ${pool.title}?`} pool={pool.key} title={pool.title} block="Пул" /></div><div><h1 className="text-4xl font-semibold tracking-tight">{pool.title}</h1><p className="mt-1 text-muted-foreground">{pool.subtitle}</p></div></div>
    <GlassCard className="flex items-center justify-between gap-2 p-4"><div><p className="text-sm text-muted-foreground">Доходность</p><p className="mt-1 text-xl font-semibold tabular text-gain">до {pct(pool.rate_max, 2)}</p></div><div><p className="text-sm text-muted-foreground">Сделок</p><p className="mt-1 text-xl font-semibold tabular">{pool.deals_count}</p></div><Ring value={progress} size={68} stroke={6}><span className="text-sm font-semibold tabular">{Math.round(progress)}%</span><span className="text-[10px] text-muted-foreground">собрано</span></Ring></GlassCard>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">Сделки</h2>{deals.length ? <div className="stagger space-y-3">{deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}</div> : <p className="text-muted-foreground">Пока нет сделок</p>}</section>
  </>;
}
