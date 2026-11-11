import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BeamGridHeroAction = {
  label: string;
  href: string;
  variant?: "default" | "outline";
};

export type BeamGridHeroColors = {
  /** Main beam colour. Defaults to `--chart-2`. */
  beam?: string;
  /** Second beam colour, used by every other beam. Defaults to `--chart-5`. */
  beamAlt?: string;
  /** Success check colour. Defaults to `--chart-4`. */
  success?: string;
};

export type BeamGridHeroProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: BeamGridHeroAction[];
  /** Command typed in the terminal, without the prompt. */
  command: string;
  /** Lines printed after the command finishes, each with a check mark. */
  output?: string[];
  /** Text of the copyable pill, e.g. `npm i @acme/cli`. */
  install?: string;
  /** Number of beams falling at the same time. 0 disables them. */
  beamCount?: number;
  colors?: BeamGridHeroColors;
};

const CELL = 48;
const BEAM_LENGTH = 140;
const EASE = [0.19, 1, 0.22, 1] as const;

const css = `
@keyframes beam-grid-hero-drift {
  from { transform: translateY(0); }
  to { transform: translateY(${CELL * 4}px); }
}
.beam-grid-hero-grid { animation: beam-grid-hero-drift 30s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .beam-grid-hero-grid { animation: none; }
}
@keyframes beam-grid-hero-caret { 50% { opacity: 0; } }
.beam-grid-hero-caret { animation: beam-grid-hero-caret 1s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .beam-grid-hero-caret { animation: none; }
}
`;

/** Types `text` one character at a time. Restarts whenever `runKey` changes. */
function useTypewriter(text: string, enabled: boolean, runKey: number, speed = 38) {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, enabled, runKey, speed]);

  return { value: text.slice(0, count), done: count >= text.length };
}

function Terminal({ command, output, animated }: { command: string; output: string[]; animated: boolean }) {
  const [cycle, setCycle] = useState(0);
  const [lines, setLines] = useState(animated ? 0 : output.length);
  const { value, done } = useTypewriter(command, animated, cycle);

  useEffect(() => {
    if (!animated) {
      setLines(output.length);
      return;
    }
    setLines(0);
  }, [animated, output.length, cycle]);

  useEffect(() => {
    if (!animated || !done) return;
    let shown = 0;
    let hold: number | undefined;
    const id = window.setInterval(() => {
      shown += 1;
      setLines(shown);
      if (shown >= output.length) {
        window.clearInterval(id);
        hold = window.setTimeout(() => setCycle((c) => c + 1), 4200);
      }
    }, 520);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(hold);
    };
  }, [animated, done, output.length, cycle]);

  return (
    <div className="font-mono text-[13px] leading-6 sm:text-sm">
      <p className="break-all">
        <span className="select-none text-muted-foreground">$ </span>
        <span aria-label={command}>{value}</span>
        {animated && !(done && lines >= output.length) && (
          <span aria-hidden="true" className="beam-grid-hero-caret ml-px inline-block h-4 w-[7px] translate-y-0.5 bg-foreground" />
        )}
      </p>
      <ul className="mt-1 min-h-[calc(var(--lines)*1.5rem)] space-y-0" style={{ "--lines": output.length } as CSSProperties}>
        {output.slice(0, lines).map((line) => (
          <motion.li
            key={line}
            initial={animated ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-2 text-muted-foreground"
          >
            <Check
              aria-hidden="true"
              className="mt-1 size-4 shrink-0"
              style={{ color: "var(--beam-grid-hero-success)" }}
            />
            <span className="min-w-0 break-words">{line}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

type Geometry = { width: number; frameTop: number; frameLeft: number; frameRight: number };
type Burst = { id: number; x: number; particles: { dx: number; dy: number; size: number }[] };

function Beam({
  index,
  geometry,
  onHit,
}: {
  index: number;
  geometry: Geometry;
  onHit: (x: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let timer: number | undefined;
    let controls: { stop: () => void } | undefined;
    const sleep = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)));

    (async () => {
      await sleep(index * 900 + Math.random() * 900);
      while (!cancelled) {
        const min = Math.ceil((geometry.frameLeft + 14) / CELL);
        const max = Math.floor((geometry.frameRight - 14) / CELL);
        const col = min + Math.floor(Math.random() * Math.max(1, max - min + 1));
        const x = col * CELL;
        el.style.left = `${x - 1}px`;
        const travel = geometry.frameTop;
        const run = animate(el, { y: [-BEAM_LENGTH, travel - BEAM_LENGTH], opacity: [0, 1, 1] }, {
          duration: 1.1 + travel / 700,
          ease: [0.5, 0, 0.9, 0.6],
          opacity: { times: [0, 0.15, 1], duration: 1.1 + travel / 700 },
        });
        controls = run;
        await run.finished.catch(() => undefined);
        if (cancelled) return;
        el.style.opacity = "0";
        onHitRef.current(x);
        await sleep(1400 + Math.random() * 2600);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controls?.stop();
    };
  }, [index, geometry]);

  const color = index % 2 === 0 ? "var(--beam-grid-hero-beam)" : "var(--beam-grid-hero-beam-alt)";
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute top-0 w-0.5 rounded-full opacity-0"
      style={{
        height: BEAM_LENGTH,
        background: `linear-gradient(to bottom, transparent, ${color})`,
        boxShadow: `0 0 12px 1px color-mix(in oklch, ${color} 60%, transparent)`,
      }}
    >
      <span
        className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-foreground"
        style={{ boxShadow: `0 0 10px 3px ${color}` }}
      />
    </div>
  );
}

function BurstParticles({ burst, y, onDone }: { burst: Burst; y: number; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onDone(burst.id), 900);
    return () => window.clearTimeout(t);
  }, [burst.id, onDone]);
  return (
    <>
      {burst.particles.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: burst.x,
            top: y,
            width: p.size,
            height: p.size,
            background: i % 2 ? "var(--beam-grid-hero-beam)" : "var(--beam-grid-hero-beam-alt)",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function CopyPill({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = () => {
    void navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${text}`}
      className="inline-flex max-w-full items-center gap-2.5 rounded-full border bg-card/70 py-1.5 pl-4 pr-2 font-mono text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm"
    >
      <span className="truncate">{text}</span>
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-foreground">
        {copied ? (
          <Check aria-hidden="true" className="size-3.5" style={{ color: "var(--beam-grid-hero-success)" }} />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </span>
      <span role="status" className="sr-only">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  );
}

export function BeamGridHero({
  eyebrow,
  title,
  description,
  actions = [],
  command,
  output = [],
  install,
  beamCount = 5,
  colors,
  className,
  style,
  ...props
}: BeamGridHeroProps) {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [flash, setFlash] = useState(0);
  const burstId = useRef(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    const measure = () => {
      const s = section.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      setGeometry({
        width: s.width,
        frameTop: f.top - s.top,
        frameLeft: f.left - s.left,
        frameRight: f.right - s.left,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  const onHit = useCallback((x: number) => {
    const n = 8 + Math.floor(Math.random() * 5);
    const particles = Array.from({ length: n }, (_, i) => {
      const angle = Math.PI + (Math.PI * (i + 0.5 + (Math.random() - 0.5) * 0.6)) / n;
      const dist = 22 + Math.random() * 38;
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, size: 2 + Math.round(Math.random() * 2) };
    });
    burstId.current += 1;
    setBursts((b) => [...b, { id: burstId.current, x, particles }]);
    setFlash((f) => f + 1);
  }, []);
  const removeBurst = useCallback((id: number) => setBursts((b) => b.filter((x) => x.id !== id)), []);

  const words = title.split(" ");
  const rootStyle = {
    "--beam-grid-hero-beam": colors?.beam ?? "var(--chart-2)",
    "--beam-grid-hero-beam-alt": colors?.beamAlt ?? "var(--chart-5)",
    "--beam-grid-hero-success": colors?.success ?? "var(--chart-4)",
    ...style,
  } as CSSProperties;
  const mask = "radial-gradient(ellipse 70% 65% at 50% 40%, #000 25%, transparent 100%)";
  const line = "color-mix(in oklch, var(--foreground) 11%, transparent)";

  return (
    <section
      ref={sectionRef}
      className={cn("relative isolate overflow-hidden bg-background text-foreground", className)}
      style={rootStyle}
      {...props}
    >
      <style>{css}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <div
          className="beam-grid-hero-grid absolute inset-x-0 -top-48 bottom-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        />
      </div>

      {!reduce && geometry && beamCount > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: beamCount }, (_, i) => (
            <Beam key={i} index={i} geometry={geometry} onHit={onHit} />
          ))}
          {bursts.map((b) => (
            <BurstParticles key={b.id} burst={b} y={geometry.frameTop} onDone={removeBurst} />
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        {eyebrow && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-5 inline-flex items-center rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            {eyebrow}
          </motion.p>
        )}
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          <span className="sr-only">{title}</span>
          <span aria-hidden="true">
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: "50%", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.05 }}
              >
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </span>
        </h1>
        {description && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 + words.length * 0.05 }}
            className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>
        )}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 + words.length * 0.05 }}
          className="mt-8 flex w-full flex-col items-center gap-4"
        >
          {actions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {actions.map((a) => (
                <Button key={a.label} asChild size="lg" variant={a.variant ?? "default"} className="rounded-full">
                  <a href={a.href}>{a.label}</a>
                </Button>
              ))}
            </div>
          )}
          {install && <CopyPill text={install} />}
        </motion.div>

        <div ref={frameRef} className="relative mt-14 w-full max-w-2xl text-left sm:mt-16">
          <div className="relative rounded-2xl border bg-card/40 p-1.5 shadow-sm backdrop-blur">
            <motion.div
              key={flash}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl border-2"
              style={{ borderColor: "var(--beam-grid-hero-beam)" }}
              initial={{ opacity: flash === 0 ? 0 : 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <div className="rounded-xl border bg-card">
              <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-border" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-border" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-border" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">terminal</span>
              </div>
              <div className="p-4 sm:p-5">
                <Terminal command={command} output={output} animated={!reduce} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
