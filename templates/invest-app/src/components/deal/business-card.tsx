import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronRight, Handshake } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { HalalBadge } from "@/components/company/halal-badge";
import { GlassCard } from "@/components/viz/glass-card";
import { RatingBadge } from "@/components/viz/rating-badge";
import { Ring } from "@/components/viz/ring";
import { pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

// Кто покупает товар: рейтинг, дисциплина оплат на бирже и проверки агента.
// Проверки — полный текст в строках с галочкой, без обрезки.
export function BusinessCard({ deal }: { deal: DealDetail }) {
  const b = deal.business;
  const stats = [
    { icon: Handshake, value: b.uzex_deals.toLocaleString("ru-RU"), label: "сделок на бирже" },
    { icon: CalendarDays, value: String(b.uzex_since), label: "на бирже с" },
  ];
  return (
    <GlassCard className="space-y-5 p-5">
      <Link href={`/companies/${b.id}`} className="flex min-h-11 items-center gap-4">
        <RatingBadge rating={b.rating} size={56} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{b.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{b.kind} · {b.region}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <HalalBadge halal={b.halal} />
        <span className="text-sm text-muted-foreground">ИНН {b.inn}</span>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-secondary p-4">
        <Ring size={64} stroke={6} value={Number(b.uzex_paid_pct)} className="text-gain">
          <span className="text-sm font-semibold tabular">{pct(b.uzex_paid_pct, 0)}</span>
        </Ring>
        <div className="min-w-0">
          <p className="font-semibold">Платит в срок</p>
          <p className="text-sm text-muted-foreground">доля оплаченных вовремя сделок</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-3xl bg-secondary p-4">
            <Icon className="size-5 text-muted-foreground" />
            <p className="mt-2 text-2xl font-semibold tabular">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {deal.agent_checks.length > 0 && (
        <ul className="space-y-3">
          {deal.agent_checks.slice(0, 4).map((check, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground">
                <BadgeCheck className="size-4" />
              </span>
              <span className="pt-0.5 text-[15px] leading-snug">{check}</span>
            </li>
          ))}
        </ul>
      )}
      <AskAiButton company_id={b.id} deal_id={deal.id} title={b.name} block="Компания" question="Проверь эту компанию" label="Проверить компанию" className="min-h-11" />
    </GlassCard>
  );
}
