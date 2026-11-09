import { dateShort } from "@/lib/format";

const W = 320, H = 100, TOP = 6, BOTTOM = 78;

export function PriceChart({ points, thresholdPrice }: { points: [string, number][]; thresholdPrice?: number }) {
  if (!points.length) return null;
  const prices = points.map((p) => p[1]);
  const min = Math.min(...prices, ...(thresholdPrice === undefined ? [] : [thresholdPrice]));
  const max = Math.max(...prices, ...(thresholdPrice === undefined ? [] : [thresholdPrice]));
  const y = (v: number) => BOTTOM - (v - min) / (max - min || 1) * (BOTTOM - TOP);
  const x = (i: number) => i / (points.length - 1 || 1) * W;
  const line = points.reduce((path, p, i) => i === 0
    ? `M ${x(i)} ${y(p[1])}`
    : `${path} C ${(x(i - 1) + x(i)) / 2} ${y(points[i - 1][1])}, ${(x(i - 1) + x(i)) / 2} ${y(p[1])}, ${x(i)} ${y(p[1])}`, "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="История цены">
      <path d={`${line} L ${x(points.length - 1)} ${BOTTOM} L 0 ${BOTTOM} Z`} className="fill-gain/10" />
      {thresholdPrice !== undefined && (
        <line x1="0" x2={W} y1={y(thresholdPrice)} y2={y(thresholdPrice)} className="stroke-destructive" strokeDasharray="4 4" />
      )}
      <path d={line} className="fill-none stroke-gain" strokeWidth="3" strokeLinecap="round" />
      <text x="0" y={H} className="fill-muted-foreground text-[10px]">{dateShort(points[0][0])}</text>
      <text x={W} y={H} textAnchor="end" className="fill-muted-foreground text-[10px]">{dateShort(points[points.length - 1][0])}</text>
    </svg>
  );
}
