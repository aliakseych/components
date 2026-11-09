import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type BentoSpan = "normal" | "wide" | "tall" | "full";
export type BentoTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export type BentoItem = {
  /** Shown above the title. Defaults to the item's position, such as "01". */
  eyebrow?: string;
  title: string;
  description?: string;
  span?: BentoSpan;
  /** Tints the whole tile. Without it the tile uses the card surface. */
  tone?: BentoTone;
};

/** Colour roles. Each is any CSS colour and defaults to a theme token. Tone tints stay on chart-1 to chart-5. */
export type BentoGridColors = {
  /** Plain tile surface. Default `var(--card)`. */
  surface?: string;
  /** Plain tile border. Default `var(--border)`. */
  border?: string;
  /** Eyebrow and description text. Default `var(--muted-foreground)`. */
  muted?: string;
};

export type BentoGridProps = ComponentPropsWithoutRef<"section"> & {
  title?: string;
  items?: BentoItem[];
  colors?: BentoGridColors;
};

function themeStyle(colors: BentoGridColors | undefined): CSSProperties {
  return {
    "--bento-grid-surface": colors?.surface ?? "var(--card)",
    "--bento-grid-border": colors?.border ?? "var(--border)",
    "--bento-grid-muted": colors?.muted ?? "var(--muted-foreground)",
  } as CSSProperties;
}

const spanClasses: Record<BentoSpan, string> = {
  normal: "",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  full: "md:col-span-4",
};

const toneClasses: Record<BentoTone, string> = {
  "chart-1": "border-chart-1/25 bg-chart-1/15",
  "chart-2": "border-chart-2/25 bg-chart-2/15",
  "chart-3": "border-chart-3/25 bg-chart-3/15",
  "chart-4": "border-chart-4/25 bg-chart-4/15",
  "chart-5": "border-chart-5/25 bg-chart-5/15",
};

const defaultItems: BentoItem[] = [
  {
    title: "Plan the quarter in one place",
    description: "Goals, owners and dates stay together, so nobody has to ask where the plan lives.",
    span: "wide",
    tone: "chart-1",
  },
  {
    title: "Ship with confidence",
    description: "Checks run before every release, and rollbacks take one click.",
    tone: "chart-2",
  },
  {
    title: "Reviews that stay readable",
    description: "Comments sit next to the line they refer to, and resolved threads fold away.",
    span: "tall",
    tone: "chart-3",
  },
  {
    title: "Shared views for every team",
    description: "Save a filter once and share it with the people who need it.",
    tone: "chart-4",
  },
  {
    title: "One timeline for everything",
    description: "Releases, incidents and launches share a single calendar with a clear history.",
    span: "wide",
    tone: "chart-5",
  },
];

export function BentoGrid({
  title = "Everything your team needs",
  items = defaultItems,
  colors,
  className,
  style,
  ...props
}: BentoGridProps) {
  return (
    <section
      className={cn("flex w-full flex-col gap-6", className)}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>

      <ul className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(13rem,auto)] md:grid-flow-dense md:grid-cols-4">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className={cn("flex min-w-0", spanClasses[item.span ?? "normal"])}>
            <article
              className={cn(
                "flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-xl border p-5 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                item.tone ? toneClasses[item.tone] : "border-(--bento-grid-border) bg-(--bento-grid-surface)",
              )}
            >
              <span className="font-mono text-xs tabular-nums text-(--bento-grid-muted)">
                {item.eyebrow ?? String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-auto flex flex-col gap-2 pt-8">
                <h3 className="text-xl font-semibold leading-tight tracking-tight text-balance sm:text-2xl">{item.title}</h3>
                {item.description && <p className="text-sm leading-relaxed text-(--bento-grid-muted)">{item.description}</p>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
