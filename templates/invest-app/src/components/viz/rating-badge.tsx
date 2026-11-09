import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  A: "bg-lime text-lime-foreground",
  B: "bg-accent text-accent-foreground",
  C: "bg-secondary text-foreground",
};

// Крупный «знак качества» бизнеса: буква рейтинга в круге.
export function RatingBadge({ rating, size = 48, className }: { rating: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold", TONE[rating] ?? TONE.C, className)}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {rating}
    </span>
  );
}
