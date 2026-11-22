// Neutral placeholder mark: a sun disc with twelve rays next to the wordmark. Sized in em so the intro lockup and
// the nav lockup share proportions (the intro flies one into the other). Replace with your own logo.
import { cn } from "@/lib/utils";

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const p = (r: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(33)}L${p(46)}`;
});

export function SunMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("sun-mark", className)}>
      <svg viewBox="0 0 100 100" className="sun-mark-sun" aria-hidden="true">
        <g className="sun-mark-rays">
          {RAYS.map((d) => (
            <path key={d} d={d} className="sun-mark-ray" />
          ))}
        </g>
        <circle cx="50" cy="50" r="24" className="sun-mark-disc" />
      </svg>
      <span className="sun-mark-word">{name}</span>
    </span>
  );
}
