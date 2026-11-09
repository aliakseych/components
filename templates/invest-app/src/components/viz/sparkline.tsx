// Мини-график цены. Цвет — через className (stroke-*), растягивается по ширине.
export function Sparkline({
  points,
  height = 40,
  className,
}: {
  points: number[];
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return <div style={{ height }} />;
  const w = 100;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * w).toFixed(2)},${(height - 3 - ((p - min) / span) * (height - 6)).toFixed(2)}`)
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full overflow-visible" style={{ height }}>
      <path
        d={d}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={className ?? (up ? "stroke-gain" : "stroke-destructive")}
      />
    </svg>
  );
}
