import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-7xl lg:px-10", className)} {...props} />;
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive-950 dark:focus-visible:outline-white";

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: "solid" | "ghost"; size?: "sm" | "md" }) {
  return (
    <a
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-full text-sm/7 font-medium transition-colors",
        size === "md" ? "px-4 py-2" : "px-3 py-1",
        variant === "solid"
          ? "bg-olive-950 text-background hover:bg-olive-800 dark:bg-olive-300 dark:text-olive-950 dark:hover:bg-olive-200"
          : "text-olive-950 hover:bg-olive-950/10 dark:text-white dark:hover:bg-white/10",
        focus,
        className,
      )}
      {...props}
    />
  );
}

export { focus as focusRing };

const gradients = {
  green: "linear-gradient(to bottom, #9ca88f, #596352)",
  purple: "linear-gradient(to bottom, #7b627d, #8f6976)",
  brown: "linear-gradient(to bottom, #8d7359, #765959)",
  blue: "linear-gradient(to bottom, #637c86, #778599)",
};
export type Gradient = keyof typeof gradients;

/** Noise gradient frame with an inset product surface, as in the reference imagery. */
export function GradientFrame({
  gradient,
  className,
  inset,
  children,
}: {
  gradient: Gradient;
  className?: string;
  /** "top": centred, inset on the top and sides. "corner": inset top-left, bleeding right and bottom. */
  inset: "top" | "corner";
  children: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundImage: gradients[gradient] }}>
      <div className="oatmeal-noise pointer-events-none absolute inset-0 opacity-30 dark:opacity-25" />
      <div className="relative h-full">
        <div className={cn("relative h-full", inset === "top" ? "px-[min(10%,4rem)] pt-[min(10%,4rem)]" : "pt-[min(10%,4rem)] pl-[min(10%,4rem)]")}>
          <div className={cn("relative h-full overflow-hidden ring-1 ring-black/10", inset === "top" ? "rounded-t-sm" : "rounded-tl-sm")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 5 8" width="5" height="8" fill="none" aria-hidden="true" className={className}>
      <path d="M1 1l3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
