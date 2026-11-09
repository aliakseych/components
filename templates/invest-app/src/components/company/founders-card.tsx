// Доли — это части целого: сплошной пай-чарт без скруглённых концов (маленькая доля видна честно).
import { GlassCard } from "@/components/viz/glass-card";
import { pct } from "@/lib/format";
import type { Founder } from "@/lib/types";

const COLORS = [
  { fill: "fill-gain", dot: "bg-gain" },
  { fill: "fill-[oklch(0.6_0.14_300)]", dot: "bg-[oklch(0.6_0.14_300)]" },
  { fill: "fill-[oklch(0.6_0.12_235)]", dot: "bg-[oklch(0.6_0.12_235)]" },
  { fill: "fill-[oklch(0.7_0.15_55)]", dot: "bg-[oklch(0.7_0.15_55)]" },
];

function Pie({ values, size = 128 }: { values: number[]; size?: number }) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const point = (a: number) => `${50 + 50 * Math.cos(a)} ${50 + 50 * Math.sin(a)}`;
  const starts = values.map((_, i) => -Math.PI / 2 + values.slice(0, i).reduce((sum, value) => sum + value, 0) / total * 2 * Math.PI);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0" aria-hidden>
      {values.map((value, i) => {
        const sweep = (value / total) * 2 * Math.PI;
        const start = starts[i];
        const fillClass = `${COLORS[i % COLORS.length].fill} stroke-card`;
        if (sweep >= 2 * Math.PI - 1e-6) return <circle key={i} cx={50} cy={50} r={50} className={fillClass} />;
        return <path key={i} d={`M50 50 L${point(start)} A50 50 0 ${sweep > Math.PI ? 1 : 0} 1 ${point(start + sweep)} Z`} className={fillClass} strokeWidth={1.5} strokeLinejoin="round" />;
      })}
    </svg>
  );
}

export function FoundersCard({ founders }: { founders: Founder[] }) {
  return (
    <GlassCard className="space-y-4">
      <h2 className="text-lg font-semibold">Доли учредителей</h2>
      {founders.length ? (
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Pie values={founders.map((founder) => founder.share_pct)} />
          <ul className="min-w-40 flex-1 space-y-3">
            {founders.map((founder, i) => (
              <li key={`${founder.name}-${i}`} className="flex items-start gap-2 text-sm">
                <span className={`mt-1 size-2.5 shrink-0 rounded-full ${COLORS[i % COLORS.length].dot}`} />
                <span className="min-w-0 flex-1">{founder.name}</span>
                <span className="font-semibold tabular">{pct(founder.share_pct)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : <p className="text-sm text-muted-foreground">Нет данных об учредителях</p>}
    </GlassCard>
  );
}
