import { cn } from "@/lib/utils";

/** A round avatar with initials on a hue-based gradient, plus an optional online dot. */
export function Avatar({ name, hue, size = 52, online, className }: { name: string; hue: number; size?: number; online?: boolean; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundImage: `linear-gradient(to bottom, oklch(0.76 0.14 ${hue}), oklch(0.6 0.15 ${hue}))`,
      }}
    >
      {initials}
      {online && <span className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-background bg-ok" />}
    </span>
  );
}
