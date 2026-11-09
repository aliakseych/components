import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { DealAiSkeleton } from "@/components/ai/ai-skeletons";
import { DealAiCard } from "@/components/ai/deal-ai-card";
import { Collateral } from "@/components/collateral";
import { BusinessCard } from "@/components/deal/business-card";
import { GoalCard } from "@/components/deal/goal-card";
import { ItemsCard } from "@/components/deal/items-card";
import { ParamsChips } from "@/components/deal/params-chips";
import { Calculator } from "@/components/deal/calculator";
import { StepsCard } from "@/components/deal/steps-card";
import { StatusBadge } from "@/components/deal-badges";
import { InvestDrawer } from "@/components/invest-drawer";
import { PageHeader } from "@/components/page-header";
import { PoolBar } from "@/components/pool-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/viz/glass-card";
import { CATEGORY_ICON, CATEGORY_TONE, mln, pct } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import { useParams } from "next/navigation";
import type { DealDetail, Investor } from "@/lib/types";

export default function DealPage() {
  return (
    <>
      <PageHeader back="/deals" />
      <Suspense fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-36 rounded-[28px]" />
          <Skeleton className="h-52 rounded-[28px]" />
          <Skeleton className="h-52 rounded-[28px]" />
        </div>
      }>
        <Deal />
      </Suspense>
    </>
  );
}

function Deal() {
  const { id } = useParams<{ id: string }>();
  const { data: deal } = useApi<DealDetail>(`/deals/${id}/`);
  const meState = useApi<Investor>("/me/");
  const me = meState.data;
  useTitle(deal?.title ?? "Сделка");
  if (!deal || meState.status !== "ready") return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-36 rounded-[28px]" />
          <Skeleton className="h-52 rounded-[28px]" />
          <Skeleton className="h-52 rounded-[28px]" />
        </div>
  );
  const Icon = CATEGORY_ICON[deal.category];
  const tone = CATEGORY_TONE[deal.category];
  const stats = [
    [pct(deal.investor_rate, 2), "в год"],
    [`${deal.term_days} дней`, "срок"],
    [mln(deal.min_investment), "минимум"],
  ];

  return (
    <main className={`stagger mx-auto w-full min-w-0 max-w-md space-y-4 px-4 ${deal.status === "collecting" ? "pb-48" : "pb-32"}`}>
      <GlassCard className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className={`flex size-16 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}>
            <Icon className="size-8" />
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{deal.ticker}</span>
            <StatusBadge status={deal.status} />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{deal.title}</h1>
          <div className="mt-1 text-muted-foreground">{deal.business.name}</div>
        </div>
        <div className="flex justify-end"><AskAiButton question="Объясни сделку просто" deal_id={deal.id} title={deal.title} block="Сделка" /></div>
      </GlassCard>
      <GoalCard deal={deal} />
      <Suspense fallback={<DealAiSkeleton />}><DealAiCard id={deal.id} authenticated={!!me} /></Suspense>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(([value, label], i) => (
          <div key={label} className={`min-w-0 rounded-[28px] p-3 ${i === 0 ? "bg-lime text-lime-foreground" : "bg-card"}`}>
            <div className="break-words text-lg font-semibold tabular">{value}</div>
            <div className="text-sm opacity-70">{label}</div>
          </div>
        ))}
      </div>
      <Calculator deal={deal} />
      <ItemsCard deal={deal} />
      <PoolBar
        deal_id={deal.id}
        down_payment={deal.down_payment}
        down_payment_pct={deal.down_payment_pct}
        investors_amount={deal.investors_amount}
        bank_amount={deal.bank_amount}
      />
      <StepsCard deal={deal} />
      <BusinessCard deal={deal} />
      <Collateral deal={deal} />
      <ParamsChips deal={deal} />
      {deal.my_investment && (
        <Link href={`/portfolio/${deal.id}`}>
          <GlassCard className="flex items-center justify-between bg-lime p-5 text-lime-foreground">
            <span className="font-semibold">
              Ваше вложение <span className="tabular">{mln(deal.my_investment.amount)}</span>
            </span>
            <ChevronRight className="size-5" />
          </GlassCard>
        </Link>
      )}
      {deal.status === "collecting" && (
        <div className="glass fixed inset-x-4 bottom-[96px] z-30 mx-auto max-w-md rounded-full p-1.5">
          {me ? (
            <InvestDrawer deal={deal} balance={me.balance} />
          ) : (
            <Link href={`/login?next=/deals/${deal.id}`} className="flex h-14 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              Войти и вложить
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
