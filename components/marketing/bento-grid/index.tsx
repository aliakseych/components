import { useEffect, useRef, type ComponentPropsWithoutRef, type CSSProperties, type PointerEvent } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type BentoSpan = "normal" | "wide" | "tall" | "full";
export type BentoTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

/** Card effect: pointer-tracked glow, a beam travelling the border, or none. */
export type BentoEffect = "none" | "spotlight" | "beam";

export type BentoItem = {
  /** Shown above the title. Defaults to the item's position, such as "01". */
  eyebrow?: string;
  title: string;
  description?: string;
  span?: BentoSpan;
  /** Tints the whole tile. Without it the tile uses the card surface. */
  tone?: BentoTone;
  /** Overrides the grid-level `effect` for this card. */
  effect?: BentoEffect;
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
  /** Default effect for every card. Default `"none"`. */
  effect?: BentoEffect;
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

const ringMask: CSSProperties = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

function BeamRing({ color }: { color: string }) {
  const angle = useMotionValue(0);
  useEffect(() => {
    const controls = animate(angle, 360, { duration: 6, ease: "linear", repeat: Infinity });
    return () => controls.stop();
  }, [angle]);
  const background = useMotionTemplate`conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, transparent 300deg, ${color} 350deg, transparent 360deg)`;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] p-px"
      style={{ ...ringMask, background }}
    />
  );
}

function BentoCard({
  item,
  index,
  effect,
  reduce,
}: {
  item: BentoItem;
  index: number;
  effect: BentoEffect;
  reduce: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const color = item.tone ? `var(--${item.tone})` : "var(--primary)";
  const spotlight = effect === "spotlight" && !reduce;
  const beam = effect === "beam" && !reduce;

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <article
      ref={ref}
      onPointerMove={spotlight ? onPointerMove : undefined}
      style={{ "--x": "50%", "--y": "50%", "--bento-fx": color } as CSSProperties}
      className={cn(
        "group relative flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-xl border p-5 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        item.tone ? toneClasses[item.tone] : "border-(--bento-grid-border) bg-(--bento-grid-surface)",
      )}
    >
      {spotlight && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(260px circle at var(--x) var(--y), color-mix(in oklab, var(--bento-fx) 22%, transparent), transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              ...ringMask,
              background:
                "radial-gradient(180px circle at var(--x) var(--y), var(--bento-fx), transparent 70%)",
            }}
          />
        </>
      )}
      {beam && <BeamRing color={color} />}
      <span className="relative font-mono text-xs tabular-nums text-(--bento-grid-muted)">
        {item.eyebrow ?? String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative mt-auto flex flex-col gap-2 pt-8">
        <h3 className="text-xl font-semibold leading-tight tracking-tight text-balance sm:text-2xl">{item.title}</h3>
        {item.description && <p className="text-sm leading-relaxed text-(--bento-grid-muted)">{item.description}</p>}
      </div>
    </article>
  );
}

export function BentoGrid({
  title = "Everything your team needs",
  items = defaultItems,
  colors,
  effect = "none",
  className,
  style,
  ...props
}: BentoGridProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <section
      className={cn("flex w-full flex-col gap-6", className)}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>

      <motion.ul
        className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(13rem,auto)] md:grid-flow-dense md:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        transition={{ staggerChildren: reduce ? 0 : 0.08 }}
      >
        {items.map((item, index) => (
          <motion.li
            key={`${item.title}-${index}`}
            className={cn("flex min-w-0", spanClasses[item.span ?? "normal"])}
            variants={{
              hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: "easeOut" } },
            }}
          >
            <BentoCard item={item} index={index} effect={item.effect ?? effect} reduce={reduce} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
