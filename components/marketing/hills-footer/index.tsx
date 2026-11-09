import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowRight, GitBranch, MessagesSquare, Play, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type HillsFooterLink = { label: string; href: string };
export type HillsFooterColumn = { title: string; links: HillsFooterLink[] };
export type HillsFooterSocial = HillsFooterLink & { icon: LucideIcon };
export type HillsFooterBrand = HillsFooterLink & { logo?: ReactNode };
export type HillsFooterColors = {
  sky: string;
  skyBottom: string;
  sun: string;
  /** Four hill layers, far to near. Extra entries are ignored; a short list repeats its last colour. */
  hills: string[];
  mist: string;
};

export type HillsFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children"> & {
  headline: string;
  /** A word or phrase inside `headline` that is set in italic. Ignored when it is not found. */
  accent?: string;
  intro?: string;
  cta?: HillsFooterLink;
  /** Optional brand link shown above the newsletter. Its logo turns on hover. */
  brand?: HillsFooterBrand;
  columns?: HillsFooterColumn[];
  social?: HillsFooterSocial[];
  onSubscribe?: (email: string) => void;
  /** Seed for the hill shapes. The same seed always draws the same landscape. */
  seed?: number;
  /** CSS colours for the scene, including theme tokens such as `var(--chart-2)`. Unset keys use the defaults. */
  colors?: Partial<HillsFooterColors>;
};

const DEFAULT_COLORS: HillsFooterColors = {
  sky: "var(--chart-2)",
  skyBottom: "var(--background)",
  sun: "var(--chart-3)",
  hills: ["var(--chart-4)", "var(--chart-4)", "var(--chart-4)", "var(--chart-4)"],
  mist: "var(--background)",
};

// Far to near. `top` is the resting ridge line as a share of the scene height,
// `amp` the ridge height, and `alpha` lets far layers sit back into the sky.
const HILLS = [
  { top: 0.56, amp: 0.1, alpha: 0.45 },
  { top: 0.64, amp: 0.085, alpha: 0.6 },
  { top: 0.74, amp: 0.07, alpha: 0.8 },
  { top: 0.86, amp: 0.05, alpha: 1 },
];

// Soft bands that drift sideways. `speed` is in px per second.
const MIST = [
  { x: 0.05, y: 0.52, radius: 0.5, squash: 0.16, speed: 7 },
  { x: 0.4, y: 0.6, radius: 0.42, squash: 0.2, speed: 11 },
  { x: 0.7, y: 0.5, radius: 0.5, squash: 0.14, speed: 9 },
  { x: 0.95, y: 0.66, radius: 0.36, squash: 0.2, speed: 8 },
];

const RIDGE_POINTS = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Enter an email address, such as you@example.com.";
const EASE_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

const DEFAULT_COLUMNS: HillsFooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "#" },
      { label: "Status", href: "#" },
      { label: "API docs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const DEFAULT_SOCIAL: HillsFooterSocial[] = [
  { label: "Community", href: "#", icon: MessagesSquare },
  { label: "Videos", href: "#", icon: Play },
  { label: "Source code", href: "#", icon: GitBranch },
];

const LINK_CLASS =
  "inline-block rounded-sm text-sm text-muted-foreground [transition:color_350ms_ease,transform_500ms_cubic-bezier(0.16,1,0.3,1)] hover:translate-x-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-colors motion-reduce:hover:translate-x-0";

/** Small seeded PRNG (mulberry32) so the hills are generated, not stored as images. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Control values in -1..1 for each hill layer, drawn once per seed. */
function createRidges(seed: number) {
  const random = createRandom(seed);
  return HILLS.map(() => Array.from({ length: RIDGE_POINTS }, () => random() * 2 - 1));
}

/** Cosine-interpolated ridge value at a 0..1 position across the scene. */
function ridgeAt(values: number[], fraction: number) {
  const position = Math.min(Math.max(fraction, 0), 1) * (values.length - 1);
  const index = Math.min(Math.floor(position), values.length - 2);
  const local = position - index;
  const eased = (1 - Math.cos(Math.PI * local)) / 2;
  return values[index] + (values[index + 1] - values[index]) * eased;
}

const progress = (time: number, start: number, duration: number) =>
  Math.min(1, Math.max(0, (time - start) / duration));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type Pointer = { x: number; y: number; tx: number; ty: number };

/** Draws one frame. `time` is ms since the scene started, or Infinity for the final state. */
function paintScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: HillsFooterColors,
  ridges: number[][],
  time: number,
  pointer: Pointer,
  seconds: number,
) {
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, colors.sky);
  sky.addColorStop(1, colors.skyBottom);
  ctx.globalAlpha = 1;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Sun glow, fading in and following the pointer slightly.
  const sunAlpha = easeOut(progress(time, 0, 1600));
  if (sunAlpha > 0) {
    const cx = width * (0.5 + 0.3 * pointer.x);
    const cy = height * (0.5 + 0.08 * pointer.y);
    const radius = Math.max(width, height) * 0.5;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, colors.sun);
    glow.addColorStop(1, "transparent");
    ctx.globalAlpha = sunAlpha * 0.6;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  // Hills rise one after another. Parallax moves each layer by its depth.
  HILLS.forEach((layer, index) => {
    const rise = easeOut(progress(time, 150 + index * 120, 1700));
    const riseOffset = height * (0.2 + 0.07 * index) * (1 - rise);
    const dx = -pointer.x * (2 + 5 * index);
    const dy = -pointer.y * (1 + 2 * index) + riseOffset;
    const baseY = height * layer.top;
    const values = ridges[index];
    const left = -24;
    const right = width + 24;

    ctx.globalAlpha = layer.alpha;
    ctx.fillStyle = colors.hills[Math.min(index, colors.hills.length - 1)];
    ctx.beginPath();
    for (let x = left; x <= right; x += 8) {
      const y = baseY + ridgeAt(values, x / width) * height * layer.amp + dy;
      if (x === left) ctx.moveTo(x + dx, y);
      else ctx.lineTo(x + dx, y);
    }
    ctx.lineTo(right + dx, height + 40);
    ctx.lineTo(left + dx, height + 40);
    ctx.closePath();
    ctx.fill();
  });

  // Mist fades in, then drifts sideways forever. Each band wraps at the edges.
  const mistAlpha = easeInOut(progress(time, 900, 1700));
  if (mistAlpha > 0) {
    ctx.globalAlpha = mistAlpha * 0.5;
    for (const band of MIST) {
      const radius = width * band.radius;
      const travel = (((band.x * width + seconds * band.speed) % width) + width) % width;
      for (const offset of [-width, 0, width]) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, colors.mist);
        gradient.addColorStop(1, "transparent");
        ctx.save();
        ctx.translate(travel + offset, height * band.y);
        ctx.scale(1, band.squash);
        ctx.fillStyle = gradient;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        ctx.restore();
      }
    }
  }

  // Horizon hairline: expands from the centre, then fades.
  const expand = easeOut(progress(time, 150, 550));
  const lineAlpha = 1 - progress(time, 700, 400);
  if (expand > 0 && lineAlpha > 0) {
    const lineWidth = width * 0.78 * expand;
    ctx.globalAlpha = lineAlpha * 0.8;
    ctx.fillStyle = colors.sun;
    ctx.fillRect((width - lineWidth) / 2, height * 0.5, lineWidth, 1);
  }

  // Sky-coloured cover hides the scene at first, then fades out.
  const cover = 1 - easeInOut(progress(time, 100, 2000));
  if (cover > 0) {
    ctx.globalAlpha = cover;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.globalAlpha = 1;
}

/** Turns theme tokens into concrete colours. Canvas cannot read `var()` itself. */
function resolveColors(probe: HTMLElement, palette: HillsFooterColors): HillsFooterColors {
  const read = (value: string) => {
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };
  return {
    sky: read(palette.sky),
    skyBottom: read(palette.skyBottom),
    sun: read(palette.sun),
    hills: palette.hills.map(read),
    mist: read(palette.mist),
  };
}

type Word = { text: string; accent: boolean };

/** Splits the headline into words, marking the ones that fall inside `accent`. */
function toWords(headline: string, accent?: string): Word[] {
  const start = accent ? headline.indexOf(accent) : -1;
  const end = start === -1 ? -1 : start + (accent?.length ?? 0);
  return Array.from(headline.matchAll(/\S+/g)).map((match) => {
    const from = match.index ?? 0;
    const to = from + match[0].length;
    return { text: match[0], accent: start !== -1 && from >= start && to <= end };
  });
}

function DefaultLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="9" r="4" />
      <path d="M2 19c3-4 6-4 10-1s7 3 10-1" />
    </svg>
  );
}

export function HillsFooter({
  headline,
  accent,
  intro = "Confidential, patient support is one click away.",
  cta = { label: "Contact support", href: "#" },
  brand,
  columns = DEFAULT_COLUMNS,
  social = DEFAULT_SOCIAL,
  onSubscribe,
  seed = 7,
  colors,
  className,
  ...props
}: HillsFooterProps) {
  const formId = useId();
  const sceneRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const paletteKey = JSON.stringify({ ...DEFAULT_COLORS, ...colors });
  const ridges = useMemo(() => createRidges(seed), [seed]);
  const shown = started || reduced;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Scene: sizing, visibility, pointer parallax and the frame loop. The loop runs only while visible.
  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!scene || !canvas || !probe) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = JSON.parse(paletteKey) as HillsFooterColors;
    const pointer: Pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let resolved = resolveColors(probe, palette);
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start: number | null = null;
    let visible = false;
    let raf = 0;

    const size = () => {
      const rect = scene.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const draw = (now: number) => {
      const time = reduced ? Number.POSITIVE_INFINITY : start === null ? 0 : now - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintScene(ctx, width, height, resolved, ridges, time, pointer, reduced ? 0 : now / 1000);
    };

    const frame = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      draw(now);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const run = () => {
      if (!raf && visible && !reduced) raf = requestAnimationFrame(frame);
    };

    const refresh = () => {
      draw(performance.now());
      run();
    };

    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.ty = (event.clientY - rect.top) / rect.height - 0.5;
      run();
    };
    const onLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
      run();
    };
    if (!reduced) {
      scene.addEventListener("pointermove", onMove);
      scene.addEventListener("pointerleave", onLeave);
    }

    size();
    const resizeObserver = new ResizeObserver(() => {
      size();
      refresh();
    });
    resizeObserver.observe(scene);

    // Start the rise once 12% of the scene is on screen.
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!reduced && start === null && entry.intersectionRatio >= 0.12) {
          start = performance.now();
          setStarted(true);
        }
        run();
      },
      { threshold: [0, 0.12] },
    );
    intersection.observe(scene);

    const themeObserver = new MutationObserver(() => {
      resolved = resolveColors(probe, palette);
      refresh();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    refresh();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
    };
  }, [paletteKey, ridges, reduced]);

  const reveal = (delay: number): CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(14px)",
    filter: shown ? "blur(0px)" : "blur(4px)",
    transition: reduced
      ? "none"
      : `opacity 1000ms ease ${delay}ms, transform 1000ms ${EASE_EXPO} ${delay}ms, filter 1000ms ease ${delay}ms`,
  });

  const wordStyle = (index: number): CSSProperties => ({
    transform: shown ? "translateY(0) rotate(0deg)" : "translateY(108%) rotate(4deg)",
    transition: reduced ? "none" : `transform 1150ms ${EASE_EXPO} ${520 + index * 75}ms`,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError(EMAIL_ERROR);
      if (!reduced) {
        fieldRef.current?.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 420, easing: "ease-in-out" },
        );
      }
      return;
    }
    setError(null);
    onSubscribe?.(value);
  };

  const words = toWords(headline, accent);
  const inputId = `${formId}-email`;
  const errorId = `${formId}-error`;

  return (
    <footer className={cn("relative overflow-hidden border-t text-foreground", className)} {...props}>
      <section
        ref={sceneRef}
        className="relative isolate min-h-[34rem] overflow-hidden px-6 pb-44 pt-20 text-center md:min-h-[40rem] md:pb-56 md:pt-28"
      >
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full" />
        <span ref={probeRef} aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0" />

        <h2 className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          {words.map((word, index) => (
            <Fragment key={index}>
              <span className="inline-block overflow-hidden px-[0.1em] -mx-[0.1em] pb-[0.12em] align-bottom -mb-[0.12em]">
                <span className="inline-block" style={wordStyle(index)}>
                  {word.accent ? <em className="font-medium italic tracking-normal">{word.text}</em> : word.text}
                </span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h2>
        {intro && (
          <p className="mx-auto mt-5 max-w-md text-sm text-foreground/80 md:text-base" style={reveal(900)}>
            {intro}
          </p>
        )}
        <a
          href={cta.href}
          className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full border bg-background/85 py-1.5 pl-5 pr-1.5 text-sm font-medium shadow-sm backdrop-blur transition-colors duration-500 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={reveal(1100)}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 scale-0 rounded-full bg-foreground transition-transform duration-[520ms] ease-[cubic-bezier(0.65,0,0.25,1)] group-hover:scale-100 motion-reduce:transition-none"
          />
          <span className="relative">{cta.label}</span>
          <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-foreground text-background transition-colors duration-[520ms] group-hover:bg-background group-hover:text-foreground">
            <ArrowRight
              aria-hidden="true"
              className="absolute inset-0 m-auto size-4 transition-transform duration-[520ms] ease-[cubic-bezier(0.65,0,0.25,1)] group-hover:translate-x-[24px] group-hover:-translate-y-[24px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:-translate-y-0"
            />
            <ArrowRight
              aria-hidden="true"
              className="absolute inset-0 m-auto size-4 -translate-x-[24px] translate-y-[24px] transition-transform duration-[520ms] ease-[cubic-bezier(0.65,0,0.25,1)] group-hover:translate-x-0 group-hover:translate-y-0 motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:translate-y-0"
            />
          </span>
        </a>
      </section>

      <div className="grid gap-12 border-t px-6 py-12 md:grid-cols-[1fr_1.1fr] md:px-12">
        <div className="space-y-8">
          {brand && (
            <a
              href={brand.href}
              aria-label={brand.label}
              className="group inline-grid size-10 place-items-center rounded-full border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={reveal(1000)}
            >
              <span className="grid place-items-center transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
                {brand.logo ?? <DefaultLogo />}
              </span>
            </a>
          )}

          <form onSubmit={handleSubmit} noValidate className="max-w-sm space-y-2" style={reveal(1200)}>
            <label htmlFor={inputId} className="text-sm font-medium">
              Get the newsletter
            </label>
            <div ref={fieldRef} className="group/field flex items-end gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  id={inputId}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                  className="rounded-none border-0 border-b bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-foreground transition-transform duration-700 ease-out group-focus-within/field:scale-x-100 motion-reduce:transition-none"
                />
              </div>
              <Button type="submit">Subscribe</Button>
            </div>
            {error && (
              <p id={errorId} role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </form>

          {social.length > 0 && (
            <ul className="flex gap-2" style={reveal(1300)}>
              {social.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div key={column.title} style={reveal(1200 + columnIndex * 120)}>
              <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
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
    </footer>
  );
}
