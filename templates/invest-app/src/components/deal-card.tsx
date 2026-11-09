import Link from "next/link";
import { Check } from "lucide-react";
import { HalalBadge } from "@/components/company/halal-badge";
import { CATEGORY_ICON, CATEGORY_TONE, dateShort, days, mln, pct } from "@/lib/format";
import type { DealSummary } from "@/lib/types";

export function DealCard({ deal }: { deal: DealSummary }) {
  const Icon = CATEGORY_ICON[deal.category];
  const tone = CATEGORY_TONE[deal.category];
  const paid = deal.status === "completed" ? 4 : deal.started_at && deal.next_due
    ? Math.min(3, Math.max(0, Math.round((Date.parse(deal.next_due) - Date.parse(deal.started_at)) / 86400000 / 15) - 1))
    : null;
  return (
    <Link href={`/deals/${deal.id}`} className="block rounded-[24px] bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={`flex size-[52px] shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}>
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold leading-tight">{deal.title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">{deal.ticker} · {deal.business.region}</p>
        </div>
        <span className="tabular whitespace-nowrap font-semibold text-gain">{pct(deal.investor_rate, 2)}</span>
      </div>
      {deal.status === "collecting" ? (
        <div className="mt-4 space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="grow-x h-full rounded-full bg-lime" style={{ width: `${Math.min(100, Math.max(0, deal.collected_pct))}%` }} />
          </div>
          <div className="flex justify-between gap-2 text-sm text-muted-foreground">
            <span>Собрано {mln(deal.collected_amount)} из {mln(deal.investors_amount)}</span>
            {deal.days_left !== null && <span className="shrink-0">{days(deal.days_left)}</span>}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {paid !== null && (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="grow-x h-full rounded-full bg-lime" style={{ width: `${paid * 25}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">Выплаты {paid}/4</p>
            </>
          )}
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            {deal.status === "active" && deal.next_due && <span className="rounded-full bg-muted px-3 py-1.5">Следующая {dateShort(deal.next_due)}</span>}
            {deal.status === "completed" && <span className="flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-lime-foreground"><Check className="size-3.5" />Выплачено</span>}
          </div>
        </div>
      )}
      {deal.business.halal === false && <div className="mt-3"><HalalBadge halal={false} /></div>}
      {deal.my_investment && <span className="mt-3 inline-block rounded-full bg-lime px-3 py-1.5 text-xs font-medium text-lime-foreground">Вы: {mln(deal.my_investment)}</span>}
    </Link>
  );
}
