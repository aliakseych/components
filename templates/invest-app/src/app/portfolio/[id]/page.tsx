import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { Suspense } from "react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { DealAiSkeleton } from "@/components/ai/ai-skeletons";
import { DealAiCard } from "@/components/ai/deal-ai-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collateral } from "@/components/collateral";
import { PageHeader } from "@/components/page-header";
import { ScheduleTable } from "@/components/schedule-table";
import { Donut } from "@/components/viz/donut";
import { CountUp } from "@/components/viz/count-up";
import { GlassCard } from "@/components/viz/glass-card";
import { CATEGORY_ICON, CATEGORY_TONE, dateLong, money, pct } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import type { DealDetail } from "@/lib/types";

export default function PortfolioPage() {
  return <><PageHeader back="/" /><Suspense fallback={<Skeleton className="m-4 h-96 rounded-[28px]" />}><Position /></Suspense></>;
}

function Position() {
  const { id } = useParams<{ id: string }>();
  const { data: deal } = useApi<DealDetail>(`/deals/${id}/`, { auth: true });
  useTitle(deal?.title);
  if (!deal) return <Skeleton className="m-4 h-96 rounded-[28px]" />;
  const my = deal.my_investment;
  if (!my) redirect(`/deals/${id}`);
  const expected = Number(my.expected_total);
  const received = Number(my.received_total);
  const income = Number(my.income_received) + Number(my.income_expected);
  const Icon = CATEGORY_ICON[deal.category];
  const tone = CATEGORY_TONE[deal.category];
  return (
    <main className="stagger space-y-4 p-4 pt-0 pb-32">
      <div className="flex items-center gap-3"><div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-6" /></div><h1 className="text-xl font-semibold leading-tight">{deal.title}</h1></div>
      <GlassCard className="space-y-5">
        <div><p className="text-sm text-muted-foreground">Вернётся</p><p className="tabular mt-1 break-words text-3xl font-semibold tracking-tight"><CountUp value={my.expected_total} format={money} /></p></div>
        <div className="flex justify-center"><Donut parts={[{ value: Math.max(0, received), className: "stroke-lime" }, { value: Math.max(0, expected - received), className: "stroke-muted" }]}><span className="tabular text-3xl font-semibold">{pct(expected > 0 ? received / expected * 100 : 0, 0)}</span><span className="text-sm text-muted-foreground">получено</span></Donut></div>
        <div className="flex flex-wrap gap-2 text-sm"><div className="rounded-full bg-muted px-3 py-2"><span className="text-muted-foreground">Вложено </span><b className="tabular">{money(my.amount)}</b></div><div className="rounded-full bg-muted px-3 py-2"><span className="text-muted-foreground">Получено </span><b className="tabular text-gain">{money(my.received_total)}</b></div><div className="rounded-full bg-lime px-3 py-2 text-lime-foreground"><span>Доход </span><b className="tabular">+{money(income)}</b></div></div>
      </GlassCard>
      <Suspense fallback={<DealAiSkeleton />}><DealAiCard id={deal.id} authenticated /></Suspense>
      <GlassCard><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Выплаты</h2><AskAiButton question="Когда и сколько я получу?" deal_id={deal.id} title={deal.title} block="Выплаты" /></div><ScheduleTable rows={my.schedule.map((r) => ({ label: r.due_date ? dateLong(r.due_date) : `День ${r.day}`, sub: `+${money(r.income)}`, amount: r.amount, paid_at: r.paid_at }))} /></GlassCard>
      <Collateral deal={deal} />
      <Button variant="outline" asChild className="h-12 w-full rounded-full"><Link href={`/deals/${deal.id}`}>О сделке</Link></Button>
    </main>
  );
}
