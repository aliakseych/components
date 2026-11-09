import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { StatGroup1, type StatGroup1Props } from "@/components/analytics/stat-group-01";
import { cn } from "@/lib/utils";

export type StatsBandItem = {
  /** Keys the tile. Defaults to the label. */
  key?: string;
  label: string;
  value: number;
  /** The figure the value is compared with. The change shows only when this is set. */
  previous?: number;
  /** Appended to the formatted value, such as `%` or `ms`. */
  suffix?: string;
  /** Formats the value. Defaults to the locale's plain number. */
  format?: (value: number) => string;
  /** `points` for rates, so the change reads as percentage points. @default "percent" */
  changeType?: "percent" | "points";
  /** Use `down` for metrics like latency, where a decrease is good. */
  goodDirection?: "up" | "down";
};

export type StatsBandColors = {
  /** Heading and figures. @default var(--foreground) */
  foreground?: string;
  /** Description and comparison text. @default var(--muted-foreground) */
  muted?: string;
  /** Eyebrow. @default var(--chart-1) */
  accent?: string;
};

export type StatsBandProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  /** Small label above the heading. */
  eyebrow?: string;
  title: string;
  description?: string;
  items: StatsBandItem[];
  /** Follows each previous value, such as `the year before`. @default "the previous period" */
  comparison?: string;
  /** A decorative dot grid behind the content. @default "none" */
  backdrop?: "dots" | "none";
  /** Colour of the dot grid. Any CSS colour. @default var(--border) */
  dotColor?: string;
  /** Overrides the text colours, each as any CSS colour. Unset keys use the theme tokens. */
  colors?: StatsBandColors;
};

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/**
 * A heading over a row of stat tiles from `analytics/stat-group-01`. The colours
 * and the dot grid are CSS custom properties on the section, so a parent can
 * restyle them without a class. The section paints no background of its own.
 */
export function StatsBand({
  eyebrow,
  title,
  description,
  items,
  comparison = "the previous period",
  backdrop = "none",
  dotColor,
  colors,
  className,
  style,
  ...props
}: StatsBandProps) {
  const metrics: NonNullable<StatGroup1Props["metrics"]> = items.map((item) => ({
    key: item.key ?? item.label,
    label: item.label,
    value: item.value,
    previous: item.previous,
    changeType: item.changeType,
    goodDirection: item.goodDirection,
    formatter: (value: number) =>
      `${item.format ? item.format(value) : numberFormatter.format(value)}${item.suffix ?? ""}`,
  }));

  const vars = {
    "--stats-band-dot": dotColor ?? "var(--border)",
    "--stats-band-foreground": colors?.foreground ?? "var(--foreground)",
    "--stats-band-muted": colors?.muted ?? "var(--muted-foreground)",
    "--stats-band-accent": colors?.accent ?? "var(--chart-1)",
    ...style,
  } as CSSProperties;

  return (
    <section
      className={cn("relative isolate flex w-full flex-col gap-8 overflow-hidden", className)}
      style={vars}
      {...props}
    >
      {backdrop === "dots" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle at center, var(--stats-band-dot) 1px, transparent 1.5px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <p
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "var(--stats-band-accent)" }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            style={{ color: "var(--stats-band-foreground)" }}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p className="max-w-xs text-sm" style={{ color: "var(--stats-band-muted)" }}>
            {description}
          </p>
        )}
      </header>

      <StatGroup1 bare comparison={comparison} metrics={metrics} />
    </section>
  );
}
