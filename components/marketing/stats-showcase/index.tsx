import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Gauge, Repeat, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
  icon: LucideIcon;
  /** The value that fills the bar completely. Defaults to 100. */
  max?: number;
};

/** Colour roles. Each is any CSS colour and defaults to a theme token. */
export type StatsShowcaseColors = {
  /** Card surface. Default `var(--card)`. */
  surface?: string;
  /** Card border. Default `var(--border)`. */
  border?: string;
  /** Bar track. Default `var(--muted)`. */
  track?: string;
  /** Labels and units. Default `var(--muted-foreground)`. */
  muted?: string;
};

export type StatsShowcaseProps = ComponentPropsWithoutRef<"section"> & {
  title?: string;
  subtitle?: string;
  stats?: StatItem[];
  /** Formats the number shown and read by assistive tech. Defaults to en-US with one decimal at most. */
  formatValue?: (value: number) => string;
  colors?: StatsShowcaseColors;
};

function themeStyle(colors: StatsShowcaseColors | undefined): CSSProperties {
  return {
    "--stats-showcase-surface": colors?.surface ?? "var(--card)",
    "--stats-showcase-border": colors?.border ?? "var(--border)",
    "--stats-showcase-track": colors?.track ?? "var(--muted)",
    "--stats-showcase-muted": colors?.muted ?? "var(--muted-foreground)",
  } as CSSProperties;
}

const defaultStats: StatItem[] = [
  { value: 12480, label: "Active workspaces", icon: Users, max: 20000 },
  { value: 99.6, suffix: "%", label: "Uptime over the last 90 days", icon: Gauge, max: 100 },
  { value: 4.2, suffix: " min", label: "Median first response", icon: Clock, max: 10 },
  { value: 38, suffix: "%", label: "Tickets closed by automations", icon: Repeat, max: 100 },
];

const chipTones = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

const barTones = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const defaultFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function StatsShowcase({
  title = "Numbers from the last quarter",
  subtitle = "What the platform handled while teams were busy shipping.",
  stats = defaultStats,
  formatValue = (value) => defaultFormatter.format(value),
  colors,
  className,
  style,
  ...props
}: StatsShowcaseProps) {
  return (
    <section
      className={cn("flex w-full flex-col gap-6", className)}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <header className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
        <p className="text-sm text-(--stats-showcase-muted) sm:text-base">{subtitle}</p>
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const max = stat.max && stat.max > 0 ? stat.max : 100;
          // The bar and the number both come from stat.value, so they cannot disagree.
          const percent = Math.min(100, Math.max(0, (stat.value / max) * 100));
          const display = `${formatValue(stat.value)}${stat.suffix ?? ""}`;
          const tone = index % chipTones.length;

          return (
            <li
              key={stat.label}
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-(--stats-showcase-border) bg-(--stats-showcase-surface) p-4 shadow-sm sm:p-5"
            >
              <span className={cn("flex size-9 items-center justify-center rounded-lg", chipTones[tone])}>
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <div className="flex flex-col gap-1">
                <p className="truncate text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                  {formatValue(stat.value)}
                  {stat.suffix && <span className="ml-0.5 text-base font-medium text-(--stats-showcase-muted)">{stat.suffix}</span>}
                </p>
                <p className="text-sm leading-snug text-(--stats-showcase-muted)">{stat.label}</p>
              </div>

              <div
                role="meter"
                aria-label={stat.label}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={stat.value}
                aria-valuetext={display}
                className="h-1.5 w-full overflow-hidden rounded-full bg-(--stats-showcase-track)"
              >
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none", barTones[tone])}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
