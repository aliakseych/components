import Link from "next/link";
import { Suspense } from "react";
import { ArrowDownToLine, ArrowUpRight, Bot, Coins, LayoutGrid, Plus } from "lucide-react";
import { ActionsList } from "@/components/agent/actions-list";
import { CountUp } from "@/components/viz/count-up";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/empty";
import { DemoAccountCta } from "@/components/demo-account-cta";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";
import { TopupDrawer } from "@/components/topup-drawer";
import { GlassCard } from "@/components/viz/glass-card";
import { SegmentedBar } from "@/components/viz/segmented-bar";
import { CATEGORY_LABEL, CATEGORY_TONE, dateShort, money } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import type { AgentAction, DealCategory, DealSummary, Investor, Operation } from "@/lib/types";

const KIND = {
  topup: { icon: ArrowDownToLine, color: "bg-accent text-accent-foreground" },
  invest: { icon: ArrowUpRight, color: "bg-muted text-foreground" },
  payout: { icon: Coins, color: "bg-lime text-lime-foreground" },
};

export default function AccountPage() {
  useTitle("Счёт");
  return <><PageHeader title="Счёт" /><main className="space-y-6 p-4 pt-2 pb-32"><Suspense fallback={<Skeleton className="h-96 w-full rounded-[28px]" />}><Account /></Suspense></main></>;
}

function Account() {
  const meState = useApi<Investor>("/me/");
  const me = meState.data;
  const opsState = useApi<{ items: Operation[] }>(me ? "/operations/" : null);
  const dealsState = useApi<{ items: DealSummary[] }>(me ? "/deals/" : null);
  const actionsState = useApi<{ items: AgentAction[] }>(me ? "/agent/actions/" : null);
  if (meState.status !== "ready") return <Skeleton className="h-96 w-full rounded-[28px]" />;
  if (!me) {
    return <>
      <GlassCard glass className="min-w-0 space-y-6">
        <div><p className="text-sm text-muted-foreground">Свободно</p><p className="tabular mt-1 text-4xl font-semibold tracking-tight text-muted-foreground">{money(0)}</p></div>
        <div className="flex gap-6">
          <a href="#demo-account" className="flex flex-col items-center gap-2 text-sm font-medium"><span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus className="size-6" /></span>Пополнить</a>
          <Link href="/deals" className="flex flex-col items-center gap-2 text-sm font-medium"><span className="flex size-14 items-center justify-center rounded-full bg-muted"><LayoutGrid className="size-6" /></span>Сделки</Link>
        </div>
      </GlassCard>
      <DemoAccountCta />
      <section className="min-w-0 space-y-3"><h2 className="text-xl font-semibold">Движение денег</h2><GlassCard className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="h-14 rounded-2xl bg-muted" /><div className="h-14 rounded-2xl bg-muted" /></div><p className="text-sm text-muted-foreground">Здесь появятся пополнения и выплаты</p></GlassCard></section>
    </>;
  }
  if (opsState.status === "loading" || dealsState.status === "loading" || actionsState.status === "loading") return <Skeleton className="h-96 w-full rounded-[28px]" />;
  const ops = opsState.data;
  const deals = dealsState.data ?? { items: [] };
  const actions = actionsState.data;
  if (!ops) return <DemoAccountCta />;
  const categories = new Map(deals.items.map((deal) => [deal.id, deal.category]));
  const summary = (kind: "invest" | "payout") => {
    const relevant = ops.items.filter((op) => op.kind === kind);
    const total = relevant.reduce((sum, op) => sum + Math.abs(Number(op.amount)), 0);
    const amounts = new Map<DealCategory, number>();
    let unknown = 0;
    for (const op of relevant) {
      const category = op.deal_id === null ? undefined : categories.get(op.deal_id);
      const amount = Math.abs(Number(op.amount));
      if (category) amounts.set(category, (amounts.get(category) ?? 0) + amount);
      else unknown += amount;
    }
    const segments = Array.from(amounts, ([category, value]) => ({ label: CATEGORY_LABEL[category], value, className: CATEGORY_TONE[category].bg }));
    if (unknown) segments.push({ label: "Другие", value: unknown, className: "bg-muted" });
    return { total, segments };
  };
  const invested = summary("invest");
  const received = summary("payout");
  const groups = new Map<string, { title: string; items: Operation[] }>();
  for (const op of ops.items) {
    const date = new Date(op.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date);
    const group = groups.get(key) ?? { title: month.charAt(0).toUpperCase() + month.slice(1), items: [] };
    group.items.push(op);
    groups.set(key, group);
  }
  return <>
    <GlassCard glass className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Свободно</p><p className="tabular mt-1 break-words text-4xl font-semibold tracking-tight"><CountUp value={me.balance} format={money} /></p></div>
      <div className="flex gap-6"><TopupDrawer /><Link href="/deals" className="flex flex-col items-center gap-2 text-sm font-medium"><span className="flex size-14 items-center justify-center rounded-full bg-muted"><LayoutGrid className="size-6" /></span>Сделки</Link></div>
    </GlassCard>
    <section id="agent-actions" className="space-y-3"><h2 className="text-xl font-semibold">Действия от ИИ</h2>{actions?.items.length ? <GlassCard><ActionsList actions={actions.items} showStatus /></GlassCard> : <Empty title="Действий пока нет" />}</section>
    <Link href="/account/agents" className="block"><GlassCard className="flex min-h-20 items-center gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Bot className="size-6" /></span><span className="flex-1 font-semibold">Подключить свой ИИ (MCP)</span><ArrowUpRight className="size-5" /></GlassCard></Link>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Движение денег</h2><div className="grid grid-cols-2 gap-3">{[["Вложено", invested], ["Получено", received]].map(([label, data]) => {
      const item = data as typeof invested;
      return <GlassCard key={label as string} className="min-w-0 space-y-3 p-4"><p className="text-sm text-muted-foreground">{label as string}</p><p className="tabular break-words text-lg font-semibold">{money(item.total)}</p><SegmentedBar segments={item.segments.length ? item.segments : [{ label: "Нет операций", value: 1, className: "bg-muted" }]} height={8} /></GlassCard>;
    })}</div></section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Операции</h2>{ops.items.length ? Array.from(groups, ([key, group]) => <div key={key} className="rounded-[28px] bg-card p-4"><h3 className="mb-2 font-semibold">{group.title}</h3><div className="divide-y divide-border">{group.items.map((op) => {
      const { icon: Icon, color } = KIND[op.kind];
      const positive = op.kind !== "invest";
      return <div key={op.id} className="flex min-h-16 min-w-0 items-center gap-3 py-2"><div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${color}`}><Icon className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium">{op.kind === "topup" ? "Пополнение" : op.deal_title || (op.kind === "invest" ? "Вложение" : "Выплата")}</p><p className="truncate text-sm text-muted-foreground">{dateShort(op.created_at)}</p></div><p className={`tabular min-w-0 max-w-1/2 truncate text-right text-sm font-semibold ${positive ? "text-gain" : "text-foreground"}`}>{positive ? "+" : "−"}{money(Math.abs(Number(op.amount)))}</p></div>;
    })}</div></div>) : <Empty title="Операций пока нет" />}</section>
    <GlassCard className="min-w-0 space-y-4"><div className="flex min-w-0 items-center gap-3"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">{me.name.trim().charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{me.name}</p><p className="truncate text-sm text-muted-foreground">+{me.phone.replace(/^\+/, "")}</p></div></div><LogoutButton /></GlassCard>
  </>;
}
