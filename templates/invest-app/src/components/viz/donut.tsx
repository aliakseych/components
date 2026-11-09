// Donut «часть от целого» (dashboardblocks chart-panel-05). Цвета — классы stroke-*.
export interface DonutPart {
  value: number;
  className: string;
}

export function Donut({
  parts,
  size = 160,
  stroke = 22,
  children,
}: {
  parts: DonutPart[];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const gap = parts.length > 1 ? 4 : 0;
  const offsets = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + (p.value / total) * c, 0));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {parts.map((p, i) => {
          const len = Math.max(0, (p.value / total) * c - gap);
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[i]}
              style={{ "--ring-from": c } as React.CSSProperties}
              className={`donut-in ${p.className}`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
