// Одна полоса 100%, поделённая на части (dashboardblocks breakdown-01). Цвета — классы bg-*.
export interface Segment {
  label: string;
  value: number;
  className: string;
}

export function SegmentedBar({ segments, height = 14 }: { segments: Segment[]; height?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="flex w-full gap-1" style={{ height }}>
      {segments.map((s) => (
        <div
          key={s.label}
          className={`grow-x rounded-full ${s.className}`}
          style={{ width: `${(s.value / total) * 100}%`, minWidth: s.value > 0 ? 8 : 0 }}
        />
      ))}
    </div>
  );
}
