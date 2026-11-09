import Link from "next/link";
import { CATEGORY_ICON, CATEGORY_TONE, pct } from "@/lib/format";
import type { Pool } from "@/lib/types";
import { GlassCard } from "@/components/viz/glass-card";
import { Sparkline } from "@/components/viz/sparkline";

export function PoolCard({ pool }: { pool: Pool }) {
  const Icon = CATEGORY_ICON[pool.key];
  const tone = CATEGORY_TONE[pool.key];
  const progress = Number(pool.target_total) > 0 ? Math.min(100, (Number(pool.collected_total) / Number(pool.target_total)) * 100) : 0;

  return (
    <Link href={`/pools/${pool.key}`} className="block min-w-0">
      <GlassCard className="flex h-full min-h-56 flex-col gap-3 p-4">
        <span className={`flex size-11 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}><Icon className="size-5" /></span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{pool.title}</h3>
          <p className="truncate text-sm text-muted-foreground">{pool.subtitle}</p>
        </div>
        <p className="text-xl font-semibold tabular text-gain">до {pct(pool.rate_max, 2)}</p>
        <div className="mt-auto"><Sparkline points={pool.sparkline} height={32} className={tone.stroke} /></div>
        <div className="space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`grow-x h-full rounded-full ${tone.bg}`} style={{ width: `${progress}%` }} /></div>
          <p className="text-sm text-muted-foreground">{pool.collecting_count} в сборе</p>
        </div>
      </GlassCard>
    </Link>
  );
}
