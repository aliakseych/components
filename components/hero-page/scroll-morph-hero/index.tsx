import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScrollMorphTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export type ScrollMorphItem = {
  label: string;
  /** Optional picture. Without it the tile is a tinted gradient. */
  src?: string;
  /** Token used for the gradient tile when there is no src. Defaults to the cycle of chart-1 to chart-5. */
  tone?: ScrollMorphTone;
};

export type ScrollMorphHeroColors = {
  /** Headline and end title. Default: var(--foreground). */
  text?: string;
  /** Scroll hint. Default: var(--muted-foreground). */
  muted?: string;
  /** Tile outline. Default: var(--border). */
  border?: string;
};

export type ScrollMorphHeroProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  items: ScrollMorphItem[];
  headline?: string;
  hint?: string;
  /** Shown once the tiles have spread into the arc. */
  endTitle?: string;
  /** Pins the morph to a value from 0 (ring) to 1 (arc) and ignores scrolling. Used for static previews. */
  progress?: number;
  /** CSS height of the pinned stage. Set it when the hero scrolls inside a shorter container. */
  stageHeight?: string;
  /** Colour roles. Each becomes a `--scroll-morph-hero-*` variable on the root. The section paints no background. */
  colors?: ScrollMorphHeroColors;
};

const TONES: ScrollMorphTone[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

const TONE_CLASS: Record<ScrollMorphTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

const INTRO_MS = 1000;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Deterministic pseudo-random value in [0, 1) so scattered positions stay put between renders. */
const hash = (key: number) => {
  const x = Math.sin(key * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** The nearest scrolling ancestor, or null when the page itself scrolls. */
function findScroller(node: HTMLElement) {
  let parent = node.parentElement;
  while (parent && parent !== document.body) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
    parent = parent.parentElement;
  }
  return null;
}

export function ScrollMorphHero({
  items,
  headline = "The future is built on AI.",
  hint = "Scroll to explore",
  endTitle,
  progress: pinned,
  stageHeight = "100svh",
  colors,
  className,
  style,
  ...props
}: ScrollMorphHeroProps) {
  const colorVars = {
    "--scroll-morph-hero-text": colors?.text ?? "var(--foreground)",
    "--scroll-morph-hero-muted": colors?.muted ?? "var(--muted-foreground)",
    "--scroll-morph-hero-border": colors?.border ?? "var(--border)",
  } as CSSProperties;

  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [intro, setIntro] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setSize({ w: stage.clientWidth, h: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Scattered tiles gather into the ring once on load, so the resting state never needs a scroll.
  useEffect(() => {
    if (reduced || pinned !== undefined) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = clamp01((now - start) / INTRO_MS);
      setIntro(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduced, pinned]);

  // Scroll progress: 0 when the section's top reaches the scrollport's top, 1 when its bottom does.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced || pinned !== undefined) return;
    const scroller = findScroller(section);
    const target: HTMLElement | Window = scroller ?? window;
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const range = section.offsetHeight - viewHeight;
      const top = section.getBoundingClientRect().top - viewTop;
      setScroll(range > 0 ? clamp01(-top / range) : 0);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    target.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      target.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, pinned]);

  const still = reduced || pinned !== undefined;
  const p = reduced ? 0 : pinned !== undefined ? clamp01(pinned) : scroll;
  const gathered = still ? 1 : easeInOut(intro);
  const { w, h } = size;
  const count = items.length;
  const mobile = w < 640;

  const tile = mobile ? 38 : 72;
  const tileH = tile * 1.32;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.max(0, Math.min(w, h) / 2 - tileH * 0.8);
  const spread = w * (mobile ? 0.84 : 0.8);
  const arcBase = h * 0.74;
  const arcLift = h * (mobile ? 0.2 : 0.26);

  const phaseArc = easeInOut(clamp01(p / 0.8));
  const headlineOpacity = (1 - clamp01((p - 0.05) / 0.25)) * clamp01((gathered - 0.4) / 0.6);
  const endOpacity = clamp01((p - 0.6) / 0.3);

  const placeTile = (index: number) => {
    const scatterX = (0.08 + 0.84 * hash(index * 3 + 1)) * w;
    const scatterY = (0.08 + 0.84 * hash(index * 3 + 2)) * h;
    const scatterRot = (hash(index * 3 + 3) - 0.5) * 50;

    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    const circleX = cx + radius * Math.cos(angle);
    const circleY = cy + radius * Math.sin(angle);
    const circleRot = (angle * 180) / Math.PI + 90;

    const t = count > 1 ? index / (count - 1) : 0.5;
    const arcX = (w - spread) / 2 + spread * t;
    const arcY = arcBase - arcLift * (1 - Math.pow(2 * t - 1, 2));
    const arcRot = (2 * t - 1) * 14;

    const ringX = mix(scatterX, circleX, gathered);
    const ringY = mix(scatterY, circleY, gathered);
    // Take the short way round so tiles past the half turn don't spin backwards into the arc.
    const ringRot = mix(scatterRot, circleRot > 180 ? circleRot - 360 : circleRot, gathered);

    return {
      x: mix(ringX, arcX, phaseArc),
      y: mix(ringY, arcY, phaseArc),
      rot: mix(ringRot, arcRot, phaseArc),
    };
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn("relative w-full min-w-0", className)}
      style={{
        height: reduced ? stageHeight : `calc(${stageHeight} * 2.6)`,
        ...colorVars,
        color: "var(--scroll-morph-hero-text)",
        ...style,
      }}
      {...props}
    >
      <div className="sticky top-0 overflow-hidden" style={{ height: stageHeight }}>
        <div ref={stageRef} className="absolute inset-0">
          {w > 0 &&
            items.map((item, index) => {
              const { x, y, rot } = placeTile(index);
              const tone = item.tone ?? TONES[index % TONES.length];
              return (
                <div
                  key={`${item.label}-${index}`}
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-0 overflow-hidden rounded-xl border border-[var(--scroll-morph-hero-border)] shadow-md",
                    !item.src && TONE_CLASS[tone],
                  )}
                  style={{
                    width: tile,
                    height: tileH,
                    transform: `translate3d(${x - tile / 2}px, ${y - tileH / 2}px, 0) rotate(${rot}deg)`,
                  }}
                >
                  {item.src ? (
                    <img src={item.src} alt="" className="size-full object-cover" draggable={false} />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-white/35 via-transparent to-black/20" />
                  )}
                </div>
              );
            })}

          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 px-6 text-center"
            style={{ opacity: headlineOpacity }}
          >
            <h2
              id={headingId}
              className="max-w-44 text-balance text-xl font-semibold tracking-tight sm:max-w-sm sm:text-4xl"
            >
              {headline}
            </h2>
            {!reduced && (
              <p
                aria-hidden="true"
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--scroll-morph-hero-muted)]"
              >
                {hint}
                <ArrowDown className="size-3" />
              </p>
            )}
          </div>

          {endTitle && endOpacity > 0 && (
            <p
              className="pointer-events-none absolute inset-x-0 top-[14%] z-10 text-balance px-6 text-center text-2xl font-semibold tracking-tight sm:text-4xl"
              style={{ opacity: endOpacity }}
            >
              {endTitle}
            </p>
          )}
        </div>
      </div>

      <ul className="sr-only">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}
