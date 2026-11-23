import { cn } from "@/lib/utils";

/** Neutral wordmark placeholder. Replace with your own logo. */
export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-white", className)}>
      <svg viewBox="0 0 32 32" className="h-[1.15em] w-auto" aria-hidden>
        <path d="M16 2l12 7v14l-12 7L4 23V9z" fill="currentColor" />
        <circle cx="16" cy="16" r="5" fill="#02090a" />
      </svg>
      <span className="font-display text-[1.35em] font-bold leading-none tracking-tight lowercase">{name}</span>
    </span>
  );
}
