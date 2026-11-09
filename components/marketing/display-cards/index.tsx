import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type DisplayCardItem = {
  /** Shown in the chip. Defaults to a sparkles icon. */
  icon?: ReactNode;
  title: string;
  description: string;
  date: string;
};

export type DisplayCardsColors = {
  /** Icon chip fill and the front card's title. Any CSS colour. @default var(--primary) */
  accent?: string;
  /** Card surface, drawn at 70% opacity. Any CSS colour. @default var(--card) */
  surface?: string;
  /** Shadow colour. Any CSS colour. @default var(--foreground) */
  shadow?: string;
};

export type DisplayCardsProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** One to three cards. The last card is the front of the stack, at the bottom right. */
  cards: DisplayCardItem[];
  colors?: DisplayCardsColors;
};

const STEP_X = 48;
const STEP_Y = 40;
const DEPTH = 24;

/** A dot grid for the demo wrapper behind the stack. The stack itself paints no page background. */
export function DotGridBackdrop({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage: "radial-gradient(circle at center, var(--border) 1px, transparent 1.5px)",
        backgroundSize: "16px 16px",
      }}
      {...props}
    />
  );
}

/**
 * Three cards share one grid cell and fan out down and to the right. The last card is in front.
 * Hover or keyboard focus lifts a card forward. Back cards are faded and greyed until they are reached.
 */
export function DisplayCards({ cards, colors, className, style, ...props }: DisplayCardsProps) {
  const count = cards.length;
  const frontIndex = count - 1;

  const vars = {
    "--dc-accent": colors?.accent ?? "var(--primary)",
    "--dc-surface": colors?.surface ?? "var(--card)",
    "--dc-shadow": colors?.shadow ?? "var(--foreground)",
    "--dc-count": String(count),
    "--dc-step-x": `${STEP_X}px`,
    "--dc-step-y": `${STEP_Y}px`,
    "--dc-card-w": "min(22rem, calc(100cqw - var(--dc-step-x) * (var(--dc-count) - 1)))",
    "--dc-card-h": "9rem",
  } as CSSProperties;

  return (
    // The outer box is the size container, so the card width follows the space it is given.
    <div className="w-full" style={{ containerType: "inline-size" }}>
      <div
        className={cn("relative mx-auto", className)}
        style={{
          ...vars,
          width: "calc(var(--dc-card-w) + var(--dc-step-x) * (var(--dc-count) - 1))",
          height: "calc(var(--dc-card-h) + var(--dc-step-y) * (var(--dc-count) - 1))",
          ...style,
        }}
        {...props}
      >
        <div
          className="absolute left-0 top-0 grid"
          style={{
            width: "var(--dc-card-w)",
            height: "var(--dc-card-h)",
            gridTemplateAreas: '"stack"',
            placeItems: "center",
            perspective: "1100px",
          }}
        >
          {cards.map((card, index) => {
            const isFront = index === frontIndex;
            const shadowAlpha = isFront ? "25%" : "12%";
            const contactAlpha = isFront ? "10%" : "6%";
            return (
              <article
                key={`${card.title}-${index}`}
                tabIndex={0}
                aria-label={card.title}
                className={cn(
                  "group relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left outline-none backdrop-blur-md",
                  "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "hover:[--dc-depth:1.8] focus-visible:[--dc-depth:1.8]",
                  "motion-safe:hover:[--dc-lift:40px] motion-safe:focus-visible:[--dc-lift:40px]",
                  "motion-safe:hover:[--dc-lift-z:40px] motion-safe:focus-visible:[--dc-lift-z:40px]",
                )}
                style={{
                  gridArea: "stack",
                  zIndex: index + 1,
                  width: "var(--dc-card-w)",
                  height: "var(--dc-card-h)",
                  borderColor: "var(--border)",
                  background: "color-mix(in oklab, var(--dc-surface) 70%, transparent)",
                  transform: `translate3d(calc(${index} * var(--dc-step-x)), calc(${index} * var(--dc-step-y) - var(--dc-lift, 0px)), calc(${index * DEPTH}px + var(--dc-lift-z, 0px))) skewY(-8deg)`,
                  boxShadow: [
                    `0 1px 2px color-mix(in oklab, var(--dc-shadow) ${contactAlpha}, transparent)`,
                    `0 calc(12px * var(--dc-depth, 1)) calc(32px * var(--dc-depth, 1)) calc(-12px * var(--dc-depth, 1)) color-mix(in oklab, var(--dc-shadow) ${shadowAlpha}, transparent)`,
                  ].join(", "),
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-background [&_svg]:size-3.5"
                    style={{ backgroundColor: "var(--dc-accent)" }}
                  >
                    {card.icon ?? <Sparkles aria-hidden="true" />}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-medium"
                    style={{ color: isFront ? "var(--dc-accent)" : "var(--foreground)" }}
                  >
                    {card.title}
                  </span>
                </span>
                <span className="truncate text-sm text-muted-foreground">{card.description}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{card.date}</span>

                {!isFront && (
                  <>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[inherit]"
                      style={{ background: "linear-gradient(to right, transparent 25%, var(--background))" }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-grayscale transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
                    />
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
