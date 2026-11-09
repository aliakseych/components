import { RatingBadge } from "@/components/viz/rating-badge";
import { CATEGORY_ICON, CATEGORY_LABEL, STATUS_LABEL } from "@/lib/format";
import type { DealCategory, DealStatus } from "@/lib/types";

export function DealBadges({ category, status, rating }: { category: DealCategory; status: DealStatus; rating: string }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"><Icon className="size-3.5" />{CATEGORY_LABEL[category]}</span>
      <StatusBadge status={status} />
      <RatingBadge rating={rating} size={22} />
    </div>
  );
}

export function StatusBadge({ status }: { status: DealStatus }) {
  const color = status === "collecting" ? "bg-accent text-accent-foreground" : status === "active" ? "bg-lime text-lime-foreground" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color}`}><span className="size-1.5 rounded-full bg-current" />{STATUS_LABEL[status]}</span>;
}
