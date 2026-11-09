import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AgentActionsBanner } from "@/components/agent/actions-banner";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { InsightsSkeleton } from "@/components/ai/ai-skeletons";
import { InsightsCard } from "@/components/ai/insights-card";
import { HomeBalance } from "@/components/home-balance";
import { Logo } from "@/components/logo";
import { PoolCard } from "@/components/pool-card";
import { TickerStrip } from "@/components/ticker-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/viz/glass-card";
import { Ring } from "@/components/viz/ring";
import { CATEGORY_ICON, CATEGORY_TONE, pct } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import { useScrollEdges } from "@/lib/motion";
import { getConfig } from "@/template.config";
import type { DealSummary, Investor, Pool, PortfolioItem, Stats } from "@/lib/types";

export default function HomePage() {
  useTitle(null);
  return <main className="stagger space-y-7 p-4 pb-32">
    <Suspense fallback={<><Skeleton className="h-12 rounded-full" /><Skeleton className="h-64 rounded-[28px]" /></>}><AccountOverview /></Suspense>
    <Suspense fallback={<div className="space-y-5"><Skeleton className="h-12 rounded-full" /><Skeleton className="h-64 rounded-[28px]" /><Skeleton className="h-32 rounded-[28px]" /></div>}><Explore /></Suspense>
  </main>;
}

function AccountOverview() {
  const meState = useApi<Investor>("/me/");
  const me = meState.data;
  const ready = meState.status === "ready";
  const portfolio = useApi<{ items: PortfolioItem[] }>(ready && me ? "/portfolio/" : null).data;
  const stats = useApi<Stats>(ready && !me ? "/stats/" : null).data;
  if (!ready) return <><Skeleton className="h-12 rounded-full" /><Skeleton className="h-64 rounded-[28px]" /></>;
  return <>
    <header className="flex items-center justify-between">
      <Link href="/" aria-label={getConfig().brand.name} className="flex min-h-11 min-w-0 items-center"><Logo /></Link>
      {me ? <Link href="/account" aria-label="Личный кабинет" className="flex size-11 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">{me.name.trim().charAt(0).toUpperCase()}</Link> : <Link href="/login" className="flex min-h-11 items-center rounded-full bg-card px-5 font-semibold">Войти</Link>}
    </header>
    {me ? <>
      <HomeBalance investor={me} portfolio={portfolio?.items ?? []} />
      <Suspense fallback={null}><AgentActionsBanner /></Suspense>
      {me.profile.onboarded ? <Suspense fallback={<InsightsSkeleton />}><InsightsCard /></Suspense> : <Link href="/onboarding" className="block"><GlassCard className="flex min-h-16 items-center gap-3 bg-accent"><Sparkles className="size-5 shrink-0" /><span className="font-semibold">Настроить стратегию с ИИ</span></GlassCard></Link>}
    </> : <GlassCard className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><h1 className="text-4xl font-semibold leading-tight tracking-tight">Вложите<br />в товар</h1><p className="mt-3 text-sm text-muted-foreground">До 20% годовых · от 1млн</p></div>
        <Ring value={stats?.on_time_pct ?? 0} size={92} stroke={8}><span className="text-lg font-semibold tabular">{pct(stats?.on_time_pct ?? 0)}</span><span className="text-xs text-muted-foreground">в срок</span></Ring>
      </div>
      <AskAiButton label="Спросить ИИ, как это работает" question="Как это работает?" block="Как это работает" />
      <Link href="/login" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground">Начать <ArrowUpRight className="size-4" /></Link>
    </GlassCard>}
  </>;
}

function Explore() {
  const leadersEdges = useScrollEdges();
  const deals = useApi<{ items: DealSummary[] }>("/deals/").data;
  const pools = useApi<{ items: Pool[] }>("/pools/").data;
  if (!deals || !pools) return <div className="space-y-5"><Skeleton className="h-12 rounded-full" /><Skeleton className="h-64 rounded-[28px]" /><Skeleton className="h-32 rounded-[28px]" /></div>;
  const leaders = deals.items.filter((deal) => deal.status === "collecting").sort((a, b) => b.collected_pct - a.collected_pct);
  return <>
    <TickerStrip deals={deals.items} />
    <section className="space-y-4"><h2 className="text-2xl font-semibold tracking-tight">Куда вложить</h2><div className="stagger grid grid-cols-2 gap-2">{pools.items.map((pool) => <PoolCard key={pool.key} pool={pool} />)}</div></section>
    {leaders.length > 0 && <section className="space-y-4"><h2 className="text-2xl font-semibold tracking-tight">Лидеры сбора</h2><div ref={leadersEdges} className="edge-fade-x stagger -mx-4 flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 pb-1">{leaders.map((deal) => {
      const Icon = CATEGORY_ICON[deal.category];
      const tone = CATEGORY_TONE[deal.category];
      return <Link key={deal.id} href={`/deals/${deal.id}`} className="flex w-[72px] shrink-0 snap-start flex-col items-center gap-2 text-center"><Ring value={deal.collected_pct} size={72} stroke={4}><span className={`flex size-14 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-6" /></span></Ring><span className="w-full truncate text-sm font-semibold">{deal.ticker}</span></Link>;
    })}</div></section>}
  </>;
}
