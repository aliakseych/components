import { getConfig } from "@/template.config";
import { cn } from "@/lib/utils";

// Знак бренда из getConfig().brand.mark, иначе нейтральная заглушка.
export function BrandMark({ className }: { className?: string }) {
  const mark = getConfig().brand.mark;
  if (mark) return <span className={cn("inline-flex h-10 shrink-0 items-center", className)} aria-hidden>{mark}</span>;
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18 10 10l4 4 6-8" />
      </svg>
    </span>
  );
}

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  const { name, wordmark } = getConfig().brand;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      {withText && (
        <span className="flex flex-col text-[15px] font-semibold leading-[1.05] tracking-tight" aria-hidden>
          <span>{wordmark[0]}</span>
          <span>{wordmark[1]}</span>
        </span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
