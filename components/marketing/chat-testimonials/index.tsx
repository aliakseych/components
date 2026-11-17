import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChatTestimonial = {
  quote: string;
  /** Person and role, shown under the quote. */
  author: string;
  /** Company badge shown under the bubble. */
  company: string;
  /** Optional badge mark; falls back to the company's initial. */
  logo?: ReactNode;
};

export type ChatTestimonialsProps = {
  title: ReactNode;
  items: ChatTestimonial[];
  ariaLabel?: string;
  className?: string;
};

function Tail() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 49 31"
      className="absolute -bottom-0.5 -left-[25px] h-auto w-[49px] max-w-none text-card"
    >
      <path d="M49 0v31H10c12-3 15-13 15-23V0z" fill="currentColor" />
    </svg>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" className={flip ? "rotate-180" : undefined}>
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Chat-bubble testimonial carousel: translating track (600ms, cubic-bezier(.4,0,.2,1)), chevrons, arrow keys, swipe. */
export function ChatTestimonials({ title, items, ariaLabel = "Testimonials", className }: ChatTestimonialsProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [max, setMax] = useState(0);
  const [instant, setInstant] = useState(false);

  const measure = useCallback(
    (to: number) => {
      const t = track.current;
      const v = viewport.current;
      if (!t || !v || !t.children[0]) return;
      const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
      const stride = (t.children[0] as HTMLElement).getBoundingClientRect().width + gap;
      const m = Math.max(0, t.scrollWidth - v.clientWidth);
      const reachable = stride > 0 ? Math.min(items.length - 1, Math.ceil(m / stride)) : items.length - 1;
      const clamped = Math.max(0, Math.min(reachable, to));
      setIndex(clamped);
      setMax(m);
      setOffset(Math.min(clamped * stride, m));
    },
    [items.length],
  );

  const move = (to: number, snap = false) => {
    setInstant(snap);
    measure(to);
  };

  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    const v = viewport.current;
    if (!v) return;
    let width = -1;
    const ro = new ResizeObserver(() => {
      const w = v.clientWidth;
      if (w === width) return;
      const first = width === -1;
      width = w;
      if (!first) setInstant(true);
      measure(indexRef.current);
    });
    ro.observe(v);
    return () => ro.disconnect();
  }, [measure]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(index + (e.key === "ArrowRight" ? 1 : -1), true);
    }
  };

  const btn =
    "grid size-[52px] flex-none place-items-center rounded-full bg-card text-foreground transition-[color,background-color,opacity,transform] [transition-duration:200ms,200ms,200ms,300ms] [transition-timing-function:ease,ease,ease,cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-foreground/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <section className={cn("overflow-hidden bg-muted pt-32 pb-24 text-foreground max-[800px]:pt-20 max-[800px]:pb-16", className)}>
      <div className="mx-auto w-full max-w-[1296px] px-12 max-[1199px]:px-8 max-[800px]:px-6 max-[380px]:px-5">
        <h2 className="text-left text-[56px] leading-[1.08] font-[590] tracking-[-0.23px] max-[1199px]:text-[42px] max-[800px]:text-[clamp(32px,7vw,44px)]">
          {title}
        </h2>
        <div
          ref={viewport}
          tabIndex={0}
          role="region"
          aria-label={ariaLabel}
          onKeyDown={onKey}
          onPointerDown={(e) => (start.current = e.clientX)}
          onPointerUp={(e) => {
            if (start.current !== null && Math.abs(e.clientX - start.current) > 45) move(index + (e.clientX < start.current ? 1 : -1));
            start.current = null;
          }}
          onPointerCancel={() => (start.current = null)}
          className="mt-16 touch-pan-y overflow-visible rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground/40 max-[800px]:mt-10"
        >
          <div
            ref={track}
            className={cn(
              "flex items-start gap-9 will-change-transform motion-reduce:transition-none",
              instant ? "transition-none" : "transition-transform duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]",
            )}
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {items.map((t, i) => (
              <article
                key={i}
                className="min-w-0 flex-none basis-[596px] select-none max-[800px]:max-w-[540px] max-[800px]:basis-[calc(100%-16px)]"
              >
                <div className="relative flex flex-col justify-center gap-4 rounded-[36px] bg-card px-12 py-9 max-[800px]:min-h-[258px] max-[800px]:rounded-[28px] max-[800px]:p-7">
                  <blockquote className="text-[30px] leading-[1.18] font-[590] tracking-[0.4px] text-pretty max-[800px]:text-2xl max-[800px]:leading-[1.22] max-[800px]:tracking-normal">
                    {t.quote}
                  </blockquote>
                  <p className="text-[22px] leading-7 tracking-[-0.26px] text-muted-foreground max-[800px]:text-base max-[800px]:leading-[22px]">
                    {t.author}
                  </p>
                  <Tail />
                </div>
                <div className="mt-6 flex items-center gap-2 px-12 text-xl leading-7 font-[590] uppercase max-[800px]:px-7 max-[800px]:text-base">
                  <span className="grid size-8 flex-none place-items-center overflow-hidden rounded-full bg-card text-sm">
                    {t.logo ?? t.company.charAt(0)}
                  </span>
                  <span>{t.company}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-12 flex justify-end gap-2 max-[800px]:mt-8">
          <button type="button" className={btn} aria-label="Previous testimonial" disabled={offset === 0} onClick={() => move(index - 1)}>
            <Chevron flip />
          </button>
          <button type="button" className={btn} aria-label="Next testimonial" disabled={offset >= max - 1} onClick={() => move(index + 1)}>
            <Chevron />
          </button>
        </div>
      </div>
    </section>
  );
}
