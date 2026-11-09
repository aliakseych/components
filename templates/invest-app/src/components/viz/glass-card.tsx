import { cn } from "@/lib/utils";

// Белая «круглая» карточка в стиле Т-Инвестиций. glass — полупрозрачная со стеклом.
export function GlassCard({
  className,
  glass,
  ...props
}: React.ComponentProps<"div"> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[28px] p-5",
        glass ? "glass" : "bg-card shadow-[0_2px_20px_-8px_oklch(0.27_0.012_20/12%)]",
        className,
      )}
      {...props}
    />
  );
}
