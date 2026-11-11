import { useId, useRef, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

export type SkyFooterCloud = { day: string; night?: string };
export type SkyFooterLink = { label: string; href: string };
export type SkyFooterColumn = { title: string; links: SkyFooterLink[] };

export type SkyFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children"> & {
  /** Giant brand word drawn as fluffy cloud. Real text, exposed as the image label. */
  wordmark: string;
  /** Link columns above the cloud band. */
  columns?: SkyFooterColumn[];
  /** Bottom legal line. */
  legal?: string;
  /** Cloud sprites (transparent images). Without any, soft CSS blobs are drawn. */
  clouds?: SkyFooterCloud[];
};

type Layer = {
  scale: number;
  opacity: number;
  duration: number;
  bottom: string;
  count: number;
  depth: number;
  front?: boolean;
};

// Far layers: smaller, slower, fainter, move less. Near layer sits in front of the wordmark.
const LAYERS: Layer[] = [
  { scale: 0.42, opacity: 0.45, duration: 160, bottom: "52%", count: 4, depth: 0.25 },
  { scale: 0.7, opacity: 0.7, duration: 100, bottom: "26%", count: 3, depth: 0.6 },
  { scale: 1.1, opacity: 0.92, duration: 64, bottom: "-6%", count: 2, depth: 1, front: true },
];

const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 62,
  size: 1 + (i % 3 === 0 ? 1 : 0),
  delay: (i % 7) * 0.6,
}));

function Blob() {
  return (
    <div
      className="aspect-[3/2] w-full blur-[6px] dark:brightness-[0.55]"
      style={{
        backgroundImage: [
          "radial-gradient(closest-side at 28% 62%, white 40%, rgb(255 255 255 / 0))",
          "radial-gradient(closest-side at 50% 40%, white 45%, rgb(255 255 255 / 0))",
          "radial-gradient(closest-side at 72% 62%, white 40%, rgb(255 255 255 / 0))",
          "radial-gradient(closest-side at 50% 70%, white 50%, rgb(255 255 255 / 0))",
        ].join(","),
      }}
    />
  );
}

function CloudSprite({ cloud }: { cloud?: SkyFooterCloud }) {
  if (!cloud) return <Blob />;
  if (cloud.night) {
    return (
      <>
        <img src={cloud.day} alt="" draggable={false} loading="lazy" className="w-full dark:hidden" />
        <img src={cloud.night} alt="" draggable={false} loading="lazy" className="hidden w-full dark:block" />
      </>
    );
  }
  return (
    <img
      src={cloud.day}
      alt=""
      draggable={false}
      loading="lazy"
      className="w-full dark:brightness-[0.5] dark:saturate-[0.7]"
    />
  );
}

function CloudLayer({
  layer,
  index,
  clouds,
  progress,
  pointer,
  reduced,
}: {
  layer: Layer;
  index: number;
  clouds: SkyFooterCloud[];
  progress: MotionValue<number>;
  pointer: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(progress, [0, 1], [90 * layer.depth, 0]);
  const x = useTransform(pointer, (v) => -v * 70 * layer.depth);
  const half = Array.from({ length: layer.count }, (_, i) => i);
  const renderHalf = (key: string) => (
    <div key={key} className="flex w-1/2 shrink-0 items-end justify-around">
      {half.map((i) => {
        const cloud = clouds.length ? clouds[(index + i * 2 + (key === "b" ? 1 : 0)) % clouds.length] : undefined;
        const lift = ((i * 5 + index * 3) % 7) * 4;
        return (
          <div
            key={i}
            style={{
              width: `${20 * layer.scale}rem`,
              transform: `translateY(${-lift}%) scaleX(${(i + index) % 2 ? -1 : 1})`,
            }}
          >
            <CloudSprite cloud={cloud} />
          </div>
        );
      })}
    </div>
  );
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0", layer.front ? "z-20" : "z-0")}
      style={{ bottom: layer.bottom, opacity: layer.opacity, x: reduced ? 0 : x, y: reduced ? 0 : y }}
    >
      <motion.div
        className="flex w-[200%]"
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: layer.duration, ease: "linear", repeat: Infinity, delay: -layer.duration * (index / 3) }}
      >
        {renderHalf("a")}
        {renderHalf("b")}
      </motion.div>
    </motion.div>
  );
}

function CloudWordmark({ text, reduced }: { text: string; reduced: boolean }) {
  const id = useId().replace(/:/g, "");
  const textLength = Math.min(1120, Math.max(text.length, 1) * 200);
  return (
    <motion.svg
      role="img"
      aria-label={text}
      viewBox="0 0 1200 320"
      className="relative z-10 mx-auto block w-full max-w-6xl overflow-visible"
      animate={reduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        <filter id={`${id}-cloud`} x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="5" seed="4" result="shapeNoise" />
          <feDisplacementMap in="SourceGraphic" in2="shapeNoise" scale="46" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="9" result="lump" />
          <feColorMatrix
            in="lump"
            type="matrix"
            values="0.34 0 0 0 0.66  0.34 0 0 0 0.7  0.26 0 0 0 0.8  0 0 0 0 1"
            result="tex"
          />
          <feComposite in="tex" in2="shape" operator="in" result="textured" />
          <feGaussianBlur in="shape" stdDeviation="16" result="halo" />
          <feColorMatrix in="halo" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0" result="glow" />
          <feOffset in="shape" dy="14" result="dropOff" />
          <feGaussianBlur in="dropOff" stdDeviation="12" result="dropBlur" />
          <feColorMatrix in="dropBlur" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.3  0 0 0 0 0.55  0 0 0 0.45 0" result="drop" />
          <feGaussianBlur in="textured" stdDeviation="1.4" result="soft" />
          <feMerge>
            <feMergeNode in="drop" />
            <feMergeNode in="glow" />
            <feMergeNode in="soft" />
          </feMerge>
        </filter>
      </defs>
      <text
        x="600"
        y="235"
        textAnchor="middle"
        textLength={textLength}
        lengthAdjust="spacingAndGlyphs"
        fill="white"
        filter={`url(#${id}-cloud)`}
        className="font-sans"
        style={{ fontSize: 250, fontWeight: 900, letterSpacing: "-0.02em" } as CSSProperties}
      >
        {text}
      </text>
    </motion.svg>
  );
}

export function SkyFooter({ wordmark, columns = [], legal, clouds = [], className, ...props }: SkyFooterProps) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const rawPointer = useMotionValue(0);
  const pointer = useSpring(rawPointer, { stiffness: 40, damping: 18 });

  return (
    <footer
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawPointer.set((e.clientX - r.left) / r.width - 0.5);
      }}
      onPointerLeave={() => rawPointer.set(0)}
      className={cn(
        "relative isolate w-full overflow-hidden bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 text-slate-900",
        "dark:from-slate-950 dark:via-indigo-950 dark:to-blue-950 dark:text-slate-100",
        className,
      )}
      {...props}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute animate-pulse rounded-full bg-white motion-reduce:animate-none"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {columns.length > 0 && (
        <nav
          aria-label="Footer"
          className="relative z-30 mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 pt-14 sm:grid-cols-3 md:grid-cols-4"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="rounded-sm text-sm opacity-75 transition-opacity hover:underline hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      <div className={cn("relative px-1 sm:px-4", columns.length > 0 ? "mt-4 pt-20" : "pt-28", "pb-24 sm:pb-32")}>
        {LAYERS.map((layer, i) => (
          <CloudLayer
            key={i}
            layer={layer}
            index={i}
            clouds={clouds}
            progress={scrollYProgress}
            pointer={pointer}
            reduced={reduced}
          />
        ))}
        <CloudWordmark text={wordmark} reduced={reduced} />
      </div>

      {legal && (
        <p className="relative z-30 mx-auto w-full max-w-6xl px-6 pb-8 text-center text-xs opacity-75">{legal}</p>
      )}
    </footer>
  );
}
