import Link from "next/link";
import { Suspense } from "react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { DealFilters } from "@/components/deal-filters";
import { DealsList } from "@/components/deals-list";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABEL, days, pct } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import { useSearchParams } from "next/navigation";
import type { DealCategory, DealSummary } from "@/lib/types";

type DealsResponse = { items: DealSummary[]; count: number };

export function DealsTabs({ open, closed, current }: { open: number; closed: number; current: "open" | "closed" }) {
  return (
    <nav className="flex gap-2" aria-label="Разделы сделок">
      {([
        ["open", "/deals", `Сбор · ${open}`],
        ["closed", "/deals/closed", `Выплаты · ${closed}`],
      ] as const).map(([key, href, label]) => (
        <Link key={key} href={href} aria-current={current === key ? "page" : undefined} className={`flex h-12 flex-1 items-center justify-center rounded-full text-sm font-semibold ${current === key ? "bg-primary text-primary-foreground" : "bg-card"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function DealsView({ closed = false }: { closed?: boolean }) {
  useTitle("Сделки");
  return (
    <>
      <PageHeader title="Сделки" />
      <main className="p-4 pt-2 pb-32">
        <Suspense fallback={<DealsSkeleton />}>
          <DealsContent closed={closed} />
        </Suspense>
      </main>
    </>
  );
}

function DealsSkeleton() {
  return (
    <div aria-busy className="space-y-4">
      <div className="flex gap-2"><Skeleton className="h-12 flex-1 rounded-full" /><Skeleton className="h-12 flex-1 rounded-full" /></div>
      <Skeleton className="h-12 rounded-full" />
      <div className="flex gap-2 overflow-hidden">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full" />)}</div>
      {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-[24px]" />)}
    </div>
  );
}

function DealsContent({ closed }: { closed: boolean }) {
  const searchParams = useSearchParams();
  const values: Record<string, string | string[] | undefined> = {};
  for (const key of new Set(searchParams.keys())) {
    const all = searchParams.getAll(key);
    values[key] = all.length > 1 ? all : all[0];
  }
  const query = new URLSearchParams();
  for (const key of ["q", "category", "sort", "min_rate", "max_min_investment", "max_days_left"]) {
    const value = values[key];
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value) query.set(key, value);
  }
  const status = values.status;
  query.set("status", closed && (status === "active" || status === "completed") ? status : closed ? "closed" : "open");
  const category = typeof values.category === "string" ? values.category.split(",").filter(Boolean) : [];
  const sortLabels: Record<string, string> = { relevance: "Подходящие", rate: "Доходность", deadline: "Скоро закроются", collected: "Собрано", new: "Новые", amount: "Сумма" };
  const investmentLabels: Record<string, string> = { "1000000": "1млн", "5000000": "5млн", "10000000": "10млн" };
  const filters = [
    closed && (status === "active" || status === "completed") ? `Статус выплат: ${status === "active" ? "Идут выплаты" : "Выплачено"}` : "",
    typeof values.q === "string" && values.q ? `Поиск: ${values.q}` : "",
    category.length ? `Категории: ${category.map((value) => CATEGORY_LABEL[value as DealCategory] ?? value).join(", ")}` : "",
    typeof values.sort === "string" && values.sort && values.sort !== "relevance" ? `Сортировка: ${sortLabels[values.sort] ?? values.sort}` : "",
    typeof values.min_rate === "string" && values.min_rate ? `Доходность от: ${["15", "18", "19"].includes(values.min_rate) ? pct(Number(values.min_rate)) : values.min_rate}` : "",
    typeof values.max_min_investment === "string" && values.max_min_investment ? `Вход до: ${investmentLabels[values.max_min_investment] ?? values.max_min_investment}` : "",
    typeof values.max_days_left === "string" && values.max_days_left ? `Закроется за: ${["3", "7"].includes(values.max_days_left) ? days(Number(values.max_days_left)) : values.max_days_left}` : "",
  ].filter(Boolean).join("; ");
  const result = useApi<DealsResponse>(`/deals/?${query}`).data;
  const openCount = useApi<DealsResponse>(`/deals/?${new URLSearchParams({ status: "open" })}`).data;
  const closedCount = useApi<DealsResponse>(`/deals/?${new URLSearchParams({ status: "closed" })}`).data;
  if (!result || !openCount || !closedCount) return <DealsSkeleton />;
  return (
    <div className="space-y-4">
      <div className="absolute right-4 top-3 z-10"><AskAiButton question="Подбери сделку под меня" title="Сделки" block={closed ? "Сделки — выплаты" : "Сделки — сбор"} filters={filters || undefined} /></div>
      <DealsTabs open={openCount.count} closed={closedCount.count} current={closed ? "closed" : "open"} />
      <Suspense fallback={<Skeleton className="h-32 w-full rounded-[28px]" />}>
        <DealFilters count={result.count} closed={closed} />
      </Suspense>
      <DealsList deals={result.items} />
    </div>
  );
}
