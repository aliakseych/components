import { useEffect, useRef, useState, type CSSProperties, type ComponentPropsWithoutRef, type FocusEvent } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TestimonialReview = {
  id: string;
  name: string;
  role: string;
  country: string;
  quote: string;
  initials: string;
  /** Ring colour for this avatar. Overrides the cycle from `colors`. */
  color?: string;
  /** Optional rating out of 5. When every review has one, the stats row shows the average. */
  rating?: number;
};

export type TestimonialImageWheelProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  eyebrow?: string;
  headline?: string;
  reviews: TestimonialReview[];
  ctaLabel?: string;
  /** Renders the call to action as a link. Takes priority over onReadAll. */
  href?: string;
  onReadAll?: () => void;
  /** Milliseconds before the next review is selected. 0 disables auto-advance. */
  autoAdvanceMs?: number;
  /** Seconds for one full turn of the ring. */
  rotationSeconds?: number;
  /** Outer diameter of the ring in px. */
  size?: number;
  /** Ring colours, cycled across the avatars. Any CSS colour, such as a theme token. */
  colors?: string[];
  /** Halo colour around the active avatar. */
  haloColor?: string;
};

const CHIP = 38; // resting avatar diameter, px
const FLIGHT_MS = 600;
const INTRO_MS = 700;
const INTRO_STAGGER_MS = 60;
const DEFAULT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// Motion styles live beside the markup so the component is copy-in with no global CSS.
const CSS = `
.tg-spin { animation: tg-spin var(--tg-rotation, 60s) linear infinite; }
.tg-unspin { animation: tg-unspin var(--tg-rotation, 60s) linear infinite; }
.tg-root[data-paused] .tg-spin,
.tg-root[data-paused] .tg-unspin { animation-play-state: paused; }
@keyframes tg-spin { to { transform: rotate(360deg); } }
@keyframes tg-unspin { to { transform: rotate(-360deg); } }
.tg-fade { animation: tg-fade 200ms ease-out; }
@keyframes tg-fade { from { opacity: 0; } to { opacity: 1; } }
.tg-halo {
  position: absolute;
  inset: -5px;
  border-radius: 9999px;
  border: 2px solid var(--tg-halo);
  pointer-events: none;
  animation: tg-halo 1.4s ease-out infinite;
}
@keyframes tg-halo { from { transform: scale(1); opacity: 0.7; } to { transform: scale(1.5); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .tg-spin, .tg-unspin, .tg-halo, .tg-fade { animation: none; }
}
`;

type Box = { x: number; y: number; size: number };

// Cubic bezier easing, solved by Newton iteration. Used for the flights so they match the CSS curve.
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const error = sampleX(t) - x;
      const slope = slopeX(t);
      if (Math.abs(error) < 1e-6 || Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

const BACK = cubicBezier(0.175, 0.885, 0.32, 1.275);

// Centre and diameter of an element, relative to `origin` (the flyer layer, which flyers are positioned in).
function boxOf(el: Element, origin: Element): Box {
  const o = origin.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - o.left + r.width / 2, y: r.top - o.top + r.height / 2, size: r.width };
}

function place(el: HTMLElement, box: Box) {
  el.style.transform = `translate(${box.x - box.size / 2}px, ${box.y - box.size / 2}px) scale(${box.size / CHIP})`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// FLIP-style flight: `to` is read every frame, so a target that moves (the spinning ring) is tracked.
function fly(el: HTMLElement, from: Box, to: () => Box, duration: number, onDone?: () => void) {
  place(el, from);
  if (duration <= 0) {
    place(el, to());
    onDone?.();
    return () => {};
  }
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = BACK(t);
    const target = to();
    place(el, {
      x: lerp(from.x, target.x, eased),
      y: lerp(from.y, target.y, eased),
      size: lerp(from.size, target.size, eased),
    });
    if (t < 1) frame = requestAnimationFrame(step);
    else onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

// A detached copy of a ring avatar that can fly outside the rotating ring.
function spawn(chip: HTMLElement, layer: HTMLElement) {
  const el = chip.cloneNode(true) as HTMLElement;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "absolute",
    left: "0px",
    top: "0px",
    width: `${CHIP}px`,
    height: `${CHIP}px`,
    transformOrigin: "0 0",
    transition: "none",
    visibility: "visible",
  });
  layer.appendChild(el);
  return el;
}

export function TestimonialImageWheel({
  eyebrow = "Trusted on every continent",
  headline = "What customers say, in their own words.",
  reviews,
  ctaLabel = "Read all reviews",
  href,
  onReadAll,
  autoAdvanceMs = 6000,
  rotationSeconds = 60,
  size = 260,
  colors = DEFAULT_COLORS,
  haloColor = "var(--primary)",
  className,
  style,
  ...props
}: TestimonialImageWheelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const textSlotRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flights = useRef(new Map<number, { el: HTMLElement; cancel: () => void }>());
  // Index of the avatar that is out of the ring. -1 until the opening sequence has run.
  const activeRef = useRef(-1);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovering || focused;

  const count = reviews.length;
  const radius = size / 2 - CHIP / 2;
  const rated = reviews.filter((review) => typeof review.rating === "number");
  const average =
    rated.length > 0
      ? (rated.reduce((sum, review) => sum + (review.rating ?? 0), 0) / rated.length).toFixed(1)
      : null;
  const countries = new Set(reviews.map((review) => review.country)).size;

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function select(next: number) {
    const prev = activeRef.current;
    const layer = layerRef.current;
    const slot = textSlotRef.current;
    if (!layer || !slot || next === prev || next < 0 || next >= count) return;
    const duration = reduced() ? 0 : FLIGHT_MS;
    activeRef.current = next;
    setActive(next);

    // The previous avatar flies back to its ring slot, wherever its flight has got to.
    if (prev >= 0) {
      const flight = flights.current.get(prev);
      const prevChip = chipRefs.current[prev];
      if (flight) {
        flight.cancel();
        flight.el.querySelector(".tg-halo")?.remove();
        const cancel = fly(
          flight.el,
          boxOf(flight.el, layer),
          () => boxOf(chipRefs.current[prev] ?? slot, layer),
          duration,
          () => {
            flight.el.remove();
            flights.current.delete(prev);
            if (prevChip) prevChip.style.visibility = "";
          },
        );
        flights.current.set(prev, { el: flight.el, cancel });
      }
    }

    // A stale flight for the same avatar (rapid clicks) is dropped before it flies out again.
    const stale = flights.current.get(next);
    if (stale) {
      stale.cancel();
      stale.el.remove();
      flights.current.delete(next);
    }

    const chip = chipRefs.current[next];
    if (!chip) return;
    const from = boxOf(chip, layer);
    const el = spawn(chip, layer);
    chip.style.visibility = "hidden";
    el.style.borderWidth = "3px";
    const halo = document.createElement("span");
    halo.className = "tg-halo";
    el.appendChild(halo);
    const cancel = fly(el, from, () => boxOf(slot, layer), duration);
    flights.current.set(next, { el, cancel });
  }

  // Opening sequence: avatars fly out of the text position into their ring slots, then the first review lifts out.
  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    const slot = textSlotRef.current;
    if (!root || !layer || !slot || count === 0) return;
    const skipIntro = reduced();
    const animations: Animation[] = [];
    const timers: number[] = [];

    if (!skipIntro) {
      const target = boxOf(slot, layer);
      chipRefs.current.forEach((chip, index) => {
        if (!chip) return;
        const rest = boxOf(chip, layer);
        animations.push(
          chip.animate(
            [
              { transform: `translate(${target.x - rest.x}px, ${target.y - rest.y}px) scale(0.6)`, opacity: 0 },
              { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
            ],
            {
              duration: INTRO_MS,
              delay: index * INTRO_STAGGER_MS,
              easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              fill: "backwards",
            },
          ),
        );
      });
    }

    timers.push(window.setTimeout(() => select(0), skipIntro ? 0 : (count - 1) * INTRO_STAGGER_MS + INTRO_MS));

    // Keep a parked avatar on the text slot when the layout changes.
    const observer = new ResizeObserver(() => {
      const flight = flights.current.get(activeRef.current);
      if (flight) place(flight.el, boxOf(slot, layer));
    });
    observer.observe(root);

    return () => {
      animations.forEach((animation) => animation.cancel());
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      flights.current.forEach((flight) => {
        flight.cancel();
        flight.el.remove();
      });
      flights.current.clear();
      chipRefs.current.forEach((chip) => {
        if (chip) chip.style.visibility = "";
      });
      activeRef.current = -1;
    };
  }, [count]);

  // Auto-advance, unless the wheel is paused by hover or keyboard focus.
  useEffect(() => {
    if (autoAdvanceMs <= 0 || paused || count < 2) return;
    const timer = window.setTimeout(() => select((activeRef.current + 1) % count), autoAdvanceMs);
    return () => window.clearTimeout(timer);
  }, [active, paused, autoAdvanceMs, count]);

  const shown = reviews[active] ?? reviews[0];
  const colorVars = Object.fromEntries(colors.map((color, index) => [`--tg-color-${index}`, color]));

  return (
    <section
      ref={rootRef}
      data-paused={paused ? "" : undefined}
      className={cn("tg-root relative flex w-full flex-col items-center gap-10 text-center", className)}
      style={
        {
          "--tg-rotation": `${rotationSeconds}s`,
          "--tg-halo": haloColor,
          ...colorVars,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <style>{CSS}</style>

      <header className="flex flex-col items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{headline}</h2>
        <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground tabular-nums">{count}</span> reviews
          </span>
          {average && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-foreground tabular-nums">{average}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>
            <span className="font-semibold text-foreground tabular-nums">{countries}</span> countries
          </span>
        </p>
        {href ? (
          <Button asChild size="sm">
            <a href={href}>
              {ctaLabel}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onReadAll}>
            {ctaLabel}
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </header>

      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={(event: FocusEvent<HTMLDivElement>) => {
            if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
          }}
          onBlur={() => setFocused(false)}
        >
          <div aria-hidden="true" className="absolute rounded-full border border-dashed border-border" style={{ inset: CHIP / 2 }} />
          <div role="group" aria-label="Customer reviews" className="tg-spin absolute inset-0">
            {reviews.map((review, index) => {
              const angle = (index / count) * Math.PI * 2;
              const color = review.color ?? `var(--tg-color-${index % colors.length})`;
              return (
                <div
                  key={review.id}
                  className="absolute left-1/2 top-1/2 size-0"
                  style={{ transform: `translate(${radius * Math.sin(angle)}px, ${-radius * Math.cos(angle)}px)` }}
                >
                  <button
                    type="button"
                    aria-label={`${review.name}, ${review.country}`}
                    aria-pressed={index === active}
                    onClick={() => select(index)}
                    className="tg-unspin group absolute flex items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    style={{ left: -CHIP / 2, top: -CHIP / 2, width: CHIP, height: CHIP }}
                  >
                    <span
                      ref={(el) => {
                        chipRefs.current[index] = el;
                      }}
                      aria-hidden="true"
                      className="flex size-full items-center justify-center rounded-full bg-background p-[2px] transition-transform duration-150 group-hover:scale-110"
                      style={{ borderWidth: 2, borderStyle: "solid", borderColor: color }}
                    >
                      <span className="flex size-full items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                        {review.initials}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
        </div>

        {shown && (
          <div className="flex w-full max-w-sm flex-col gap-4 text-left" aria-live="polite">
            <div className="flex items-center gap-4">
              <div ref={textSlotRef} aria-hidden="true" className="size-16 shrink-0" />
              <div key={`meta-${active}`} className="tg-fade min-w-0">
                <p className="truncate text-sm font-semibold">{shown.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {shown.role}, {shown.country}
                </p>
              </div>
            </div>
            <blockquote key={`quote-${active}`} className="tg-fade text-base leading-relaxed text-balance">
              &ldquo;{shown.quote}&rdquo;
            </blockquote>
          </div>
        )}
      </div>
    </section>
  );
}
