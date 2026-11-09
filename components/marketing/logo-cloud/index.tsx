import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LogoItem = {
  name: string;
  /** Logo drawn in the cell. Use `currentColor` so the hover colour applies. */
  node: ReactNode;
  href?: string;
};

export type LogoCloudProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  logos: LogoItem[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  /** Column count from lg up. Phones use 2 columns and tablets use 3. */
  columns?: number;
  /** Rounds the outer corners of the grid. */
  rounded?: boolean;
  /** Fill of the tinted checkerboard cells. Any CSS colour. */
  cellColor?: string;
  /** Colour of the shared grid lines. */
  borderColor?: string;
};

// Tailwind only generates classes it finds as whole strings, so every breakpoint variant is spelled out.
const tint = {
  base: { on: "bg-[color:var(--logo-cell)]", off: "bg-transparent" },
  md: { on: "md:bg-[color:var(--logo-cell)]", off: "md:bg-transparent" },
  lg: { on: "lg:bg-[color:var(--logo-cell)]", off: "lg:bg-transparent" },
} as const;

/** Checkerboard parity for a grid with `columns` columns: tinted when (row + col) is even. */
function isTinted(index: number, columns: number) {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return (row + col) % 2 === 0;
}

const contentClasses = [
  "flex h-full w-full min-w-0 items-center justify-center rounded-md p-4 text-muted-foreground outline-none",
  "transition duration-200 ease-out motion-reduce:transition-colors",
  "group-hover/cell:text-foreground focus-visible:text-foreground",
  "motion-safe:group-hover/cell:scale-[1.12] motion-safe:focus-visible:scale-[1.12]",
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
].join(" ");

export function LogoCloud({
  eyebrow,
  heading = "Companies we work with.",
  description,
  logos,
  columns = 4,
  rounded = true,
  cellColor = "var(--muted)",
  borderColor = "var(--border)",
  className,
  style,
  ...props
}: LogoCloudProps) {
  const desktopColumns = Math.max(1, Math.round(columns));
  const vars = {
    "--logo-cell": cellColor,
    "--logo-border": borderColor,
    "--logo-cols": String(desktopColumns),
  } as CSSProperties;

  return (
    <section className={cn("w-full", className)} style={{ ...vars, ...style }} {...props}>
      {(eyebrow || heading || description) && (
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 text-center">
          {eyebrow && <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
          {heading && <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{heading}</h2>}
          {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
        </header>
      )}

      <div className="mx-auto mt-8 max-w-5xl px-4">
        <ul
          className={cn(
            "grid grid-cols-2 border-l border-t border-[color:var(--logo-border)] md:grid-cols-3 lg:[grid-template-columns:repeat(var(--logo-cols),minmax(0,1fr))]",
            rounded && "overflow-hidden rounded-xl",
          )}
        >
          {logos.map((logo, index) => {
            const inner = (
              <>
                <span aria-hidden="true" className="flex max-w-full items-center justify-center">
                  {logo.node}
                </span>
                <span className="sr-only">{logo.name}</span>
              </>
            );

            return (
              <li
                key={`${logo.name}-${index}`}
                className={cn(
                  "group/cell relative flex h-20 min-w-0 items-center justify-center border-b border-r border-[color:var(--logo-border)] md:h-24",
                  isTinted(index, 2) ? tint.base.on : tint.base.off,
                  isTinted(index, 3) ? tint.md.on : tint.md.off,
                  isTinted(index, desktopColumns) ? tint.lg.on : tint.lg.off,
                )}
              >
                {logo.href ? (
                  <a href={logo.href} className={contentClasses}>
                    {inner}
                  </a>
                ) : (
                  <div className={contentClasses}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
