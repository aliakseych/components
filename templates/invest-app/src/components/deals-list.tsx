"use client";

import { usePathname } from "next/navigation";
import { DealCard } from "@/components/deal-card";
import { Empty } from "@/components/empty";
import type { DealSummary } from "@/lib/types";

export function DealsList({ deals }: { deals: DealSummary[] }) {
  const pathname = usePathname();
  return (
    <div className="stagger space-y-4">
      {deals.length ? deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      )) : (
        <Empty title="Ничего не нашли" action={{ href: pathname, label: "Сбросить" }} />
      )}
    </div>
  );
}
