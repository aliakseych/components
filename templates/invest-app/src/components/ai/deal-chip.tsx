import Link from "next/link";
import { CATEGORY_ICON, CATEGORY_TONE, pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

export function DealChip({ deal, onClick }: { deal: DealDetail; onClick?: () => void }) {
  const Icon = CATEGORY_ICON[deal.category];
  const tone = CATEGORY_TONE[deal.category];

  return (
    <Link href={`/deals/${deal.id}`} onClick={onClick} className="flex min-h-12 min-w-0 items-center gap-2 rounded-full bg-card p-1 pr-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">{deal.ticker}</span>
        <span className="block truncate text-xs text-muted-foreground">{deal.title}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular text-gain">{pct(deal.investor_rate, 2)}</span>
    </Link>
  );
}
