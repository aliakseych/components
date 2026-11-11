import {
  useRef,
  type ComponentPropsWithoutRef,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RevealFooterLink = { label: string; href: string };
export type RevealFooterColumn = { title: string; links: RevealFooterLink[] };
export type RevealFooterSocial = { label: string; href: string; icon: LucideIcon };
export type RevealFooterStatus = {
  label: string;
  /** `true` (default) shows a live green-ish dot; `false` shows a static muted one. */
  live?: boolean;
  href?: string;
};

export type RevealFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children"> & {
  /** Oversized word cropped by the bottom edge. */
  wordmark?: string;
  /** Big call-to-action heading. Omit to hide it. */
  heading?: string;
  cta?: RevealFooterLink;
  columns?: RevealFooterColumn[];
  socials?: RevealFooterSocial[];
  status?: RevealFooterStatus;
  legal?: string;
  /** Smaller type and tighter spacing. */
  compact?: boolean;
};

const SPOT_RADIUS = 260;

function Underlined({ className, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      className={cn(
        "relative inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current",
        "after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100",
        "focus-visible:after:origin-left focus-visible:after:scale-x-100 motion-reduce:after:transition-none",
        className,
      )}
    />
  );
}

/** Per-character rise from a masked baseline, staggered from the centre outwards. */
function RiseHeading({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const total = text.length;
  const mid = (total - 1) / 2;
  let index = 0;
  return (
    <h2 ref={ref} aria-label={text} className={className}>
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((char, c) => {
            const i = index++;
            return (
              <span key={c} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "115%" }}
                  animate={inView || reduce ? { y: "0%" } : undefined}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: Math.abs(i - mid) * 0.035 }}
                >
                  {char}
                </motion.span>
              </span>
            );
          })}
          {w < words.length - 1 ? "\u00A0" : null}
          {w < words.length - 1 ? ((index += 1), null) : null}
        </span>
      ))}
    </h2>
  );
}

function Wordmark({ text, compact }: { text: string; compact?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const r = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(circle ${r}px at ${x}px ${y}px, var(--foreground), transparent 70%), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 10%, transparent), var(--primary))`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - box.left);
    y.set(e.clientY - box.top);
    animate(r, SPOT_RADIUS, { duration: 0.35, ease: "easeOut" });
  };
  const leave = () => {
    animate(r, 0, { duration: 0.5, ease: "easeOut" });
  };

  return (
    <div
      aria-hidden
      onPointerMove={move}
      onPointerLeave={leave}
      className="select-none overflow-hidden"
    >
      <motion.p
        style={{ backgroundImage: background }}
        className={cn(
          "m-0 whitespace-nowrap bg-clip-text text-center font-semibold leading-none tracking-tighter text-transparent",
          compact ? "text-[min(16vw,11rem)] translate-y-[22%]" : "text-[min(22vw,15rem)] translate-y-[28%]",
        )}
      >
        {text}
      </motion.p>
    </div>
  );
}

export function RevealFooter({
  wordmark = "Acme",
  heading,
  cta,
  columns = [],
  socials = [],
  status,
  legal,
  compact = false,
  className,
  ...props
}: RevealFooterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.4, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.96, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [6, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const toTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <>
      <footer ref={ref} {...props} className={cn("sticky bottom-0 z-0", className)}>
        <motion.div
          style={{ opacity, scale, filter, transformOrigin: "50% 100%" }}
          className="flex flex-col overflow-hidden bg-card text-foreground"
        >
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col px-6",
            compact ? "gap-8 pt-12" : "gap-10 pt-14 sm:pt-16",
          )}
        >
          {heading ? (
            <div className="flex flex-col items-start gap-6">
              <RiseHeading
                text={heading}
                className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
              />
              {cta ? (
                <a
                  href={cta.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {cta.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
              ) : null}
            </div>
          ) : cta ? (
            <a
              href={cta.href}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {cta.label}
              <ArrowRight className="size-4" />
            </a>
          ) : null}

          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:flex sm:gap-16">
              {columns.map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{col.title}</h3>
                  <ul className="flex flex-col gap-2 text-sm">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Underlined href={l.href}>{l.label}</Underlined>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="flex flex-col items-start gap-4 sm:items-end">
              {socials.length ? (
                <ul className="flex gap-2">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        aria-label={label}
                        className="inline-flex size-9 items-center justify-center rounded-full border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {status ? <StatusPill {...status} /> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground">
            <span>{legal}</span>
            <button
              type="button"
              onClick={toTop}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to top <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
        <Wordmark text={wordmark} compact={compact} />
        </motion.div>
      </footer>
    </>
  );
}

function StatusPill({ label, live = true, href }: RevealFooterStatus) {
  const body = (
    <>
      <span className="relative flex size-2">
        {live ? (
          <span className="absolute inline-flex size-full rounded-full bg-chart-2 opacity-60 motion-safe:animate-ping" />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", live ? "bg-chart-2" : "bg-muted-foreground")} />
      </span>
      {label}
    </>
  );
  const cls = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground";
  return href ? (
    <a href={href} className={cn(cls, "outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring")}>
      {body}
    </a>
  ) : (
    <p role="status" className={cls}>
      {body}
    </p>
  );
}

export type RevealFooterPageProps = {
  /** Page content; it is lifted above the footer and given the page background. */
  children: ReactNode;
  footer: RevealFooterProps;
  className?: string;
};

/** Page content (`relative z-10 bg-background`) followed by a footer that is uncovered as you scroll. */
export function RevealFooterPage({ children, footer, className }: RevealFooterPageProps) {
  return (
    <div className={className}>
      <div className="relative z-10 bg-background">{children}</div>
      <RevealFooter {...footer} />
    </div>
  );
}
