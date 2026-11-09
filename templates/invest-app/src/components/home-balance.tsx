import Link from "next/link";
import { useScrollEdges } from "@/lib/motion";
import { CalendarDays, Wallet } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, dateShort, mln, money, pct } from "@/lib/format";
import type { DealCategory, Investor, PortfolioItem } from "@/lib/types";
import { GlassCard } from "@/components/viz/glass-card";
import { CountUp } from "@/components/viz/count-up";
import { Ring } from "@/components/viz/ring";
import { SegmentedBar } from "@/components/viz/segmented-bar";

const strategyLabels = { conservative: "Спокойно", balanced: "Баланс", growth: "Максимум" };
const riskLabels = { low: "Низкий риск", medium: "Средний риск", high: "Высокий риск" };

export function HomeBalance({ investor, portfolio }: { investor: Investor; portfolio: PortfolioItem[] }) {
  const chipsEdges = useScrollEdges();
  const itemsEdges = useScrollEdges();
  const current = portfolio.filter((item) => item.status !== "completed");
  const sortedPortfolio = [...current, ...portfolio.filter((item) => item.status === "completed")];
  const categoryTotals = new Map<DealCategory, number>();
  for (const item of current) {
    const outstanding = Math.max(0, Number(item.amount) - (Number(item.received_total) - Number(item.income_received)));
    categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + outstanding);
  }
  const categories = Array.from(categoryTotals, ([category, value]) => ({ category, value }));
  const segments = [
    { label: "Свободно", value: Number(investor.balance), className: "bg-muted" },
    ...categories.map(({ category, value }) => ({
      label: CATEGORY_LABEL[category],
      value,
      className: CATEGORY_TONE[category].bg,
    })),
  ];
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let allocated = 0;
  const percentages = segments.map((segment, index) => {
    if (!total) return 0;
    const percentage = index === segments.length - 1 ? 100 - allocated : Math.min(100 - allocated, Math.round(segment.value / total * 100));
    allocated += percentage;
    return percentage;
  });
  return (
    <div className="space-y-5">
      <GlassCard className="space-y-5">
        <div>
          <div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">Ваши деньги</p><AskAiButton question="Как мне распределить деньги?" block="Ваши деньги" /></div>
          <p className="mt-2 whitespace-nowrap text-[clamp(28px,10.5vw,48px)] font-semibold leading-tight tracking-tight tabular"><CountUp value={total} format={money} /></p>
          {investor.next_payout?.due_date ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground">
                <CalendarDays className="size-5" />
              </span>
              <span className="font-semibold tabular">{dateShort(investor.next_payout.due_date)}</span>
              <span className="font-semibold tabular text-gain">+{money(investor.next_payout.amount)}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Выплат пока нет</p>
          )}
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold">Распределение</h2>
          <SegmentedBar segments={segments} />
          <div ref={chipsEdges} className="edge-fade-x stagger -mx-5 flex snap-x gap-2 overflow-x-auto scroll-px-5 px-5 text-sm">
            <span className="flex shrink-0 snap-start items-center gap-1.5 rounded-full bg-muted px-3 py-2">
              <Wallet className="size-4" />
              Свободно {pct(percentages[0], 0)}
            </span>
            {categories.map(({ category }, index) => {
              const Icon = CATEGORY_ICON[category];
              const tone = CATEGORY_TONE[category];
              return (
                <span key={category} className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-2 ${tone.bg} ${tone.fg}`}>
                  <Icon className="size-4" />
                  {CATEGORY_LABEL[category]} {pct(percentages[index + 1], 0)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/account" className="flex min-h-12 items-center justify-center rounded-full bg-primary px-4 font-semibold text-primary-foreground">Пополнить</Link>
          <Link href="/deals" className="flex min-h-12 items-center justify-center rounded-full bg-muted px-4 font-semibold">Сделки</Link>
        </div>
      </GlassCard>
      {(investor.profile.strategy || investor.profile.risk_level) && <Link href="/onboarding" className="flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold">
        {investor.profile.strategy && <span className="rounded-full bg-accent px-3 py-2">{strategyLabels[investor.profile.strategy]}</span>}
        {investor.profile.risk_level && <span className="rounded-full bg-muted px-3 py-2">{riskLabels[investor.profile.risk_level]}</span>}
      </Link>}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Мои вложения</h2>
        {sortedPortfolio.length ? <div ref={itemsEdges} className="edge-fade-x stagger -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4 pb-1">{sortedPortfolio.map((item) => {
          const Icon = CATEGORY_ICON[item.category];
          const tone = CATEGORY_TONE[item.category];
          const progress = Number(item.expected_total) > 0 ? Number(item.received_total) / Number(item.expected_total) * 100 : 0;
          return <Link key={item.id} href={`/portfolio/${item.id}`} className="flex w-80 shrink-0 snap-start items-center gap-2 rounded-[28px] bg-card p-3"><span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1 truncate font-semibold">{item.title}</span><Ring value={progress} size={44} stroke={4}><span className="text-[10px] font-semibold tabular">{Math.round(progress)}%</span></Ring><span className="shrink-0 text-sm font-semibold tabular">{mln(item.amount)}</span></Link>;
        })}</div> : <Link href="/deals" className="flex min-h-12 items-center justify-center rounded-full bg-muted font-semibold">Выбрать сделку</Link>}
      </section>
    </div>
  );
}
