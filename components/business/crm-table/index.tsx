import { useId, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type CrmStage = {
  id: string;
  label: string;
  tone?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
};

export type CrmDeal = {
  id: string;
  name: string;
  company: string;
  stage: string;
  /** Whole currency units. */
  amount: number;
  /** ISO date. */
  closeDate: string;
  owner: string;
};

export type CrmTableProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  title?: string;
  stages: CrmStage[];
  deals: CrmDeal[];
  currency?: string;
  locale?: string;
};

type SortKey = "name" | "amount" | "closeDate";
type Sort = { key: SortKey; direction: "asc" | "desc" };

const TONES = {
  "chart-1": { pill: "bg-chart-1/15 text-chart-1", dot: "bg-chart-1" },
  "chart-2": { pill: "bg-chart-2/15 text-chart-2", dot: "bg-chart-2" },
  "chart-3": { pill: "bg-chart-3/15 text-chart-3", dot: "bg-chart-3" },
  "chart-4": { pill: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
  "chart-5": { pill: "bg-chart-5/15 text-chart-5", dot: "bg-chart-5" },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function CrmTable({
  title = "Opportunities",
  stages,
  deals,
  currency = "USD",
  locale = "en-US",
  className,
  ...props
}: CrmTableProps) {
  const uid = useId();
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>({ key: "amount", direction: "desc" });

  const money = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0, notation: "compact" }),
    [locale, currency],
  );
  const fullMoney = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [locale, currency],
  );
  const date = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }), [locale]);

  const stageOf = (id: string) => stages.find((stage) => stage.id === id);
  const toneOf = (stage?: CrmStage) => TONES[stage?.tone ?? "chart-2"];

  const rows = useMemo(() => {
    const filtered = stageFilter ? deals.filter((deal) => deal.stage === stageFilter) : deals;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "amount") return (a.amount - b.amount) * factor;
      return a[sort.key].localeCompare(b[sort.key]) * factor;
    });
  }, [deals, stageFilter, sort]);

  const total = rows.reduce((sum, deal) => sum + deal.amount, 0);

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" ? "asc" : "desc" },
    );

  const header = (key: SortKey, label: string, alignClass = "") => {
    const active = sort.key === key;
    const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm font-medium outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
          active && "text-foreground",
          alignClass,
        )}
      >
        {label}
        <Icon aria-hidden="true" className="size-3.5" />
      </button>
    );
  };

  const ariaSort = (key: SortKey) =>
    sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className={cn("flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
        <h2 id={`${uid}-title`} className="font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="tabular-nums">{rows.length}</span> deals,{" "}
          <span className="font-medium tabular-nums text-foreground">{fullMoney.format(total)}</span>
        </p>
      </header>

      <div role="group" aria-label="Filter by stage" className="flex gap-1.5 overflow-x-auto border-b px-4 py-2.5">
        <button
          type="button"
          aria-pressed={stageFilter === null}
          onClick={() => setStageFilter(null)}
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
            stageFilter === null && "border-foreground bg-accent",
          )}
        >
          All
        </button>
        {stages.map((stage) => {
          const inStage = deals.filter((deal) => deal.stage === stage.id);
          const sum = inStage.reduce((value, deal) => value + deal.amount, 0);
          return (
            <button
              key={stage.id}
              type="button"
              aria-pressed={stageFilter === stage.id}
              onClick={() => setStageFilter((value) => (value === stage.id ? null : stage.id))}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                stageFilter === stage.id && "border-foreground bg-accent",
              )}
            >
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", toneOf(stage).dot)} />
              {stage.label}
              <span className="font-normal tabular-nums text-muted-foreground">{money.format(sum)}</span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium">No deals here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stageFilter ? "Nothing is in this stage right now." : "Deals you add will show up in this table."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th scope="col" aria-sort={ariaSort("name")} className="px-4 py-2 font-medium">
                  {header("name", "Deal")}
                </th>
                <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">
                  Stage
                </th>
                <th scope="col" aria-sort={ariaSort("amount")} className="px-4 py-2 text-right font-medium">
                  {header("amount", "Amount")}
                </th>
                <th scope="col" aria-sort={ariaSort("closeDate")} className="hidden px-4 py-2 font-medium md:table-cell">
                  {header("closeDate", "Close date")}
                </th>
                <th scope="col" className="hidden px-4 py-2 font-medium lg:table-cell">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((deal) => {
                const stage = stageOf(deal.stage);
                const pill = (
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", toneOf(stage).pill)}>
                    {stage?.label ?? deal.stage}
                  </span>
                );
                return (
                  <tr key={deal.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-2.5 sm:max-w-0">
                      <span className="block font-medium sm:truncate">{deal.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{deal.company}</span>
                      <span className="mt-1 block sm:hidden">{pill}</span>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">{pill}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">{fullMoney.format(deal.amount)}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-muted-foreground md:table-cell">
                      {date.format(new Date(`${deal.closeDate}T00:00:00`))}
                    </td>
                    <td className="hidden px-4 py-2.5 lg:table-cell">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          aria-hidden="true"
                          className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium"
                        >
                          {initials(deal.owner)}
                        </span>
                        {deal.owner}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
