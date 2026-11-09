import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type HalftoneLink = { label: string; href: string };
export type HalftoneColumn = { title: string; links: HalftoneLink[] };
export type HalftonePreset = "ink" | "paper" | "ember" | "cobalt";
export type HalftoneColors = { background?: string; ink?: string; warm?: string };

export type HalftoneFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children"> & {
  /** Large word drawn as halftone dots along the bottom of the footer. Its bottom 20% is cropped. */
  word?: string;
  /** Maximum canvas height in px; the canvas hugs the fitted word. */
  height?: number;
  /** Dot grid cell size in px. */
  grid?: number;
  /** Grain overlay strength, from 0 to 1. */
  grain?: number;
  /** Colour set from the theme. Overridden per key by `colors`. */
  preset?: HalftonePreset;
  /** CSS colours for the section background, the resting dots and the displaced dots. */
  colors?: HalftoneColors;
  /** Line above the links, such as the studio name and city. */
  studio?: string;
  columns?: HalftoneColumn[];
  backToTopLabel?: string;
};

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number };
type Ring = { x: number; y: number; start: number };

const FONT = '"Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif';
const POINTER_RADIUS = 80;
const POINTER_FORCE = 2.6;
const SPRING = 0.05;
const DAMPING = 0.84;
const WARM_DISTANCE = 28;
const BUCKETS = 8;
const RING_SPEED = 0.9; // px per ms
const RING_DURATION = 900;
const RING_BAND = 26;
const RING_PUSH = 3.2;

const PRESETS: Record<HalftonePreset, Required<HalftoneColors>> = {
  ink: { background: "var(--background)", ink: "var(--foreground)", warm: "var(--primary)" },
  paper: { background: "var(--muted)", ink: "var(--foreground)", warm: "var(--muted-foreground)" },
  ember: {
    background: "color-mix(in oklch, var(--primary) 10%, var(--background))",
    ink: "var(--foreground)",
    warm: "var(--primary)",
  },
  cobalt: { background: "var(--background)", ink: "var(--chart-1)", warm: "var(--chart-2)" },
};

const DEFAULT_COLUMNS: HalftoneColumn[] = [
  {
    title: "Index",
    links: [
      { label: "Work", href: "#work" },
      { label: "Archive", href: "#archive" },
      { label: "Journal", href: "#journal" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "About", href: "#about" },
      { label: "Process", href: "#process" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Email", href: "mailto:hello@northwind.example" },
      { label: "Press", href: "#press" },
    ],
  },
];

const LINK_CLASS =
  "rounded-sm font-mono text-xs uppercase tracking-[0.14em] text-foreground opacity-[0.55] bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 hover:opacity-100 hover:bg-[length:100%_1px] [transition:opacity_250ms_ease,background-size_350ms_cubic-bezier(.2,.7,.1,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:[transition:none]";

// Tiled SVG noise, used as the grain overlay.
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

export function HalftoneFooter({
  word = "NORTHWIND",
  height = 560,
  grid = 6,
  grain = 0.09,
  preset = "ink",
  colors,
  studio = "Northwind Studio, 2026",
  columns = DEFAULT_COLUMNS,
  backToTopLabel = "Back to top",
  className,
  ...props
}: HalftoneFooterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  const scheme = PRESETS[preset];
  const background = colors?.background ?? scheme.background;
  const ink = colors?.ink ?? scheme.ink;
  const warm = colors?.warm ?? scheme.warm;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A hidden probe turns CSS colours (vars, color-mix) into values canvas can paint.
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    wrap.appendChild(probe);

    let inkRGB = "";
    let warmRGB = "";
    const resolveColors = () => {
      probe.style.color = ink;
      inkRGB = getComputedStyle(probe).color;
      probe.style.color = warm;
      warmRGB = getComputedStyle(probe).color;
    };

    let dots: Dot[] = [];
    let width = 0;
    // The canvas hugs the word: `height` is the ceiling, the fitted word sets the real height.
    let canvasH = height;
    let builtWidth = -1;
    let dpr = 1;
    let disposed = false;
    let pointer: { x: number; y: number } | null = null;
    const rings: Ring[] = [];
    const buckets: Dot[][] = Array.from({ length: BUCKETS + 1 }, () => []);
    let visible = true;
    let frame = 0;

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, canvasH);
      for (const list of buckets) list.length = 0;
      // Group dots by displacement so each colour blend needs one fill, not one per dot.
      for (const dot of dots) {
        const t = Math.min(1, Math.hypot(dot.x - dot.hx, dot.y - dot.hy) / WARM_DISTANCE);
        buckets[Math.round(t * BUCKETS)].push(dot);
      }
      for (let b = 0; b <= BUCKETS; b++) {
        const list = buckets[b];
        if (!list.length) continue;
        const t = b / BUCKETS;
        ctx.beginPath();
        for (const dot of list) {
          ctx.moveTo(dot.x + dot.r, dot.y);
          ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        }
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = inkRGB;
        ctx.fill();
        if (t > 0) {
          ctx.globalAlpha = t;
          ctx.fillStyle = warmRGB;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    // Advances the physics one frame. Returns true while anything is still moving.
    const step = (now: number) => {
      for (let i = rings.length - 1; i >= 0; i--) {
        if (now - rings[i].start >= RING_DURATION) rings.splice(i, 1);
      }
      let active = rings.length > 0;

      for (const dot of dots) {
        if (pointer) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS && dist > 0.001) {
            const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE;
            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;
          }
        }

        for (const ring of rings) {
          const age = now - ring.start;
          const radius = age * RING_SPEED;
          const rx = dot.hx - ring.x;
          const ry = dot.hy - ring.y;
          const dist = Math.max(Math.hypot(rx, ry), 0.001);
          const gap = Math.abs(dist - radius);
          if (gap < RING_BAND) {
            const push = (1 - gap / RING_BAND) * (1 - age / RING_DURATION) * RING_PUSH;
            dot.vx += (rx / dist) * push;
            dot.vy += (ry / dist) * push;
          }
        }

        dot.vx = (dot.vx + (dot.hx - dot.x) * SPRING) * DAMPING;
        dot.vy = (dot.vy + (dot.hy - dot.y) * SPRING) * DAMPING;
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (!active && (Math.abs(dot.vx) + Math.abs(dot.vy) > 0.01 || Math.abs(dot.x - dot.hx) + Math.abs(dot.y - dot.hy) > 0.05)) {
          active = true;
        }
      }
      return active;
    };

    const tick = (now: number) => {
      frame = 0;
      const active = step(now);
      draw();
      if (active && visible) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame && visible && !reduced) frame = requestAnimationFrame(tick);
    };

    const build = () => {
      if (disposed) return;
      const measured = Math.floor(wrap.clientWidth);
      if (measured === 0 || measured === builtWidth) return;
      builtWidth = measured;
      width = measured;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const off = document.createElement("canvas");
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      // Fit the word to the width, then let the canvas hug it: the visible part (bottom 20%
      // cropped) covers 95% of the canvas, and `height` only caps how tall that can get.
      octx.font = `800 100px ${FONT}`;
      const ascent100 = octx.measureText(word).actualBoundingBoxAscent || 72;
      const width100 = octx.measureText(word).width || 1;
      const maxCap = (height * 0.95) / 0.8;
      const size = Math.min((maxCap * 100) / ascent100, (width * 0.98 * 100) / width100);
      const cap = (ascent100 * size) / 100;
      canvasH = Math.round((cap * 0.8) / 0.95);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(canvasH * dpr);
      canvas.style.height = `${canvasH}px`;
      wrap.style.height = `${canvasH}px`;
      off.width = width;
      off.height = canvasH;

      octx.font = `800 ${size}px ${FONT}`;
      octx.textAlign = "center";
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "rgb(0, 0, 0)";
      octx.fillText(word, width / 2, canvasH + cap * 0.2);
      const data = octx.getImageData(0, 0, width, canvasH).data;

      // Coverage per grid cell sets the dot radius: sqrt(coverage) * cell * 0.56.
      // Narrow canvases get a finer grid so the word keeps its shape.
      const cell = Math.max(3, Math.min(grid, Math.round(width / 160)));
      dots = [];
      for (let gy = 0; gy < canvasH; gy += cell) {
        for (let gx = 0; gx < width; gx += cell) {
          const yEnd = Math.min(canvasH, gy + cell);
          const xEnd = Math.min(width, gx + cell);
          let sum = 0;
          let count = 0;
          for (let y = gy; y < yEnd; y++) {
            for (let x = gx; x < xEnd; x++) {
              sum += data[(y * width + x) * 4 + 3];
              count++;
            }
          }
          const coverage = sum / (count * 255);
          if (coverage < 0.02) continue;
          const cx = gx + cell / 2;
          const cy = gy + cell / 2;
          dots.push({ hx: cx, hy: cy, x: cx, y: cy, vx: 0, vy: 0, r: Math.sqrt(coverage) * cell * 0.56 });
        }
      }
      resolveColors();
      draw();
    };

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      pointer = toLocal(event);
      start();
    };
    const onLeave = () => {
      pointer = null;
      start();
    };
    const onDown = (event: PointerEvent) => {
      if ((event.target as Element).closest?.("a, button")) return;
      const { x, y } = toLocal(event);
      rings.push({ x, y, start: performance.now() });
      start();
    };

    // Theme changes re-resolve the colours and repaint.
    const onTheme = () => {
      resolveColors();
      draw();
    };
    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    schemeQuery.addEventListener("change", onTheme);

    build();
    document.fonts?.ready.then(build);

    const resize = new ResizeObserver(() => build());
    resize.observe(wrap);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    io.observe(canvas);

    if (!reduced) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
    }

    return () => {
      disposed = true;
      resize.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      schemeQuery.removeEventListener("change", onTheme);
      if (frame) cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      probe.remove();
    };
  }, [word, height, grid, reduced, ink, warm]);

  const backToTop = () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <footer
      className={cn("relative overflow-hidden border-t bg-background px-6 pt-14 text-foreground md:px-12", className)}
      {...props}
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{studio}</p>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 md:gap-x-16">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={backToTop}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {backToTopLabel}
          <ArrowUp className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div ref={wrapRef} className="relative mt-10 w-full overflow-hidden" style={{ background, maxHeight: height }}>
        <canvas ref={canvasRef} role="img" aria-label={word} className="block w-full touch-pan-y" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: GRAIN_URL, backgroundSize: "160px 160px", opacity: grain }}
        />
      </div>
    </footer>
  );
}
