"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Plain run of text; each word lights up as the reader scrolls. */
export type TextSegment = { text: string; visuals?: undefined };
/** Words with small visuals attached in front; visuals fade up in a stagger when the line enters. */
export type AttachmentSegment = {
  text?: string;
  /** Round or square visuals placed before the text. */
  visuals: ReactNode[];
  /** Overlap the visuals like an avatar stack (48px circles, -8px overlap). Default true for 2+ visuals. */
  stacked?: boolean;
};
export type HeadlineSegment = TextSegment | AttachmentSegment;

export type HeadlinePill = { label: string; image: ReactNode };

export type InlineImageHeadlineProps = {
  segments: HeadlineSegment[];
  /** Pills in the looping row under the statement. */
  pills?: HeadlinePill[];
  /** Seconds-per-pixel divisor for the marquee: duration = width / speed. Default 24 (px per second). */
  pillSpeed?: number;
  className?: string;
};

const EASE = "cubic-bezier(.25,.1,.25,1)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** One-shot fade-up when the element crosses 35% of the viewport from the bottom (800ms, site easing). */
function useReveal<T extends HTMLElement>(reduced: boolean) {
  const ref = useRef<T>(null);
  const [pending, setPending] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setPending(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPending(false);
        el.animate(
          [
            { opacity: 0, translate: "0 18px" },
            { opacity: 1, translate: "0 0" },
          ],
          { duration: 800, easing: EASE, fill: "backwards" },
        );
      },
      { threshold: 0, rootMargin: `0px 0px -${Math.round(innerHeight * 0.35)}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return { ref, pending: pending && !reduced };
}

function Attachment({ visuals, stacked, children, reduced }: { visuals: ReactNode[]; stacked: boolean; children: ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pending, setPending] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setPending(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPending(false);
        el.querySelectorAll<HTMLElement>("[data-visual]").forEach((v, i) =>
          v.animate(
            [
              { opacity: 0, translate: "0 10px", scale: 0.9 },
              { opacity: 1, translate: "0 0", scale: 1 },
            ],
            { duration: 700, delay: i * 70, easing: EASE, fill: "backwards" },
          ),
        );
      },
      { threshold: 0, rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <span ref={ref} className="inline-flex items-center gap-2 whitespace-nowrap align-middle max-[800px]:gap-[5px]">
      <span className={cn("relative isolate inline-flex shrink-0", stacked && "[&>*:not(:last-child)]:-mr-2 max-[800px]:[&>*:not(:last-child)]:-mr-1.5")}>
        {visuals.map((v, i) => (
          <span
            key={i}
            data-visual
            aria-hidden
            className={cn(
              "inline-flex size-[52px] items-center justify-center max-[800px]:size-8",
              stacked && "size-12 max-[800px]:size-[30px]",
              pending && "opacity-0",
            )}
            style={{ zIndex: visuals.length - i, translate: pending ? "0 10px" : undefined }}
          >
            {v}
          </span>
        ))}
      </span>
      {children}
    </span>
  );
}

export function InlineImageHeadline({ segments, pills = [], pillSpeed = 24, className }: InlineImageHeadlineProps) {
  const reduced = usePrefersReducedMotion();
  const statementRef = useRef<HTMLHeadingElement>(null);
  const [read, setRead] = useState(0);
  const statementReveal = useReveal<HTMLDivElement>(reduced);
  const pillsReveal = useReveal<HTMLDivElement>(reduced);

  const total = segments.reduce((n, s) => n + (s.text ? s.text.trim().split(/\s+/).length : 0), 0);

  // Scroll-linked word reading: progress 0..1 from 80% of the viewport down to 30% minus half the block.
  useEffect(() => {
    const el = statementRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduced) return setRead(total);
      const box = el.getBoundingClientRect();
      const start = innerHeight * 0.8;
      const end = innerHeight * 0.3 - box.height * 0.5;
      const progress = Math.max(0, Math.min(1, (start - box.top) / (start - end)));
      setRead(Math.floor(progress * total + 1e-9));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    update();
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, total]);

  let index = 0;
  const words = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .map((w) => {
        const i = index++;
        return (
          <span key={i} className={cn("transition-colors duration-[160ms] ease-linear motion-reduce:transition-none", i < read ? "text-[#111214] dark:text-[#f5f5f7]" : "text-[#8c8c8c] dark:text-[#6e6e73]")}>
            {w}{" "}
          </span>
        );
      });

  return (
    <section className={cn("overflow-hidden bg-background py-24 text-[#111214] min-[801px]:py-[196px] dark:text-[#f5f5f7]", className)}>
      <div className="mx-auto w-full max-w-[1296px] px-6 min-[801px]:px-12">
        <div ref={statementReveal.ref} className={cn(statementReveal.pending && "opacity-0")}>
          <h2
            ref={statementRef}
            className="text-[clamp(29px,5.9vw,44px)] font-[590] leading-[1.25] tracking-[-.23px] min-[801px]:text-[46px] min-[801px]:leading-[1.18] min-[1200px]:text-[56px]"
          >
            {segments.map((seg, si) => {
              const content = seg.text ? words(seg.text) : null;
              if (!seg.visuals) return <span key={si}>{content}</span>;
              return (
                <span key={si}>
                  <Attachment visuals={seg.visuals} stacked={seg.stacked ?? seg.visuals.length > 1} reduced={reduced}>
                    {content}
                  </Attachment>{" "}
                </span>
              );
            })}
          </h2>
        </div>
      </div>
      {/* The pill row is full-bleed: it runs edge to edge under the padded statement. */}
      {pills.length > 0 && (
        <div ref={pillsReveal.ref} className={cn(pillsReveal.pending && "opacity-0")}>
          <PillMarquee pills={pills} speed={pillSpeed} reduced={reduced} />
        </div>
      )}
    </section>
  );
}

function PillMarquee({ pills, speed, reduced }: { pills: HeadlinePill[]; speed: number; reduced: boolean }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(0);
  const [copies, setCopies] = useState(2);
  const [running, setRunning] = useState(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const win = windowRef.current;
    if (!group || !win) return;
    const size = () => {
      const w = group.getBoundingClientRect().width + 16;
      setWidth(w);
      setCopies(Math.max(2, Math.ceil(win.clientWidth / w) + 1));
    };
    const ro = new ResizeObserver(size);
    ro.observe(group);
    size();
    return () => ro.disconnect();
  }, [pills]);

  useEffect(() => {
    const win = windowRef.current;
    if (!win) return;
    let visible = false;
    const apply = () => setRunning(visible && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      apply();
    });
    io.observe(win);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className="-mb-4 mt-10 overflow-hidden pb-4 pt-0.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] min-[801px]:mt-16 min-[801px]:[mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]"
    >
      <div
        className="flex w-max items-center gap-4 will-change-transform motion-reduce:!animate-none"
        style={{
          animationName: reduced || !width ? undefined : "ihh-marquee",
          animationDuration: reduced || !width ? undefined : `${width / speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: running ? "running" : "paused",
          ["--ihh-w" as string]: `${width}px`,
        }}
      >
        {Array.from({ length: copies }, (_, c) => (
          <ul key={c} ref={c === 0 ? groupRef : undefined} aria-hidden={c > 0 || undefined} className="m-0 flex shrink-0 list-none items-center gap-4 p-0">
            {pills.map((p) => (
              <li
                key={p.label}
                className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#e9e9eb] via-[#fafafa] via-60% to-white py-1.5 pl-2.5 pr-3.5 text-[17px] font-[590] leading-[25px] tracking-[-.45px] text-[#1a1a1a] shadow-[1.25px_0_0_-.75px_#d0d0d0,-1.25px_0_0_-.75px_#d0d0d0,0_0_0_.5px_#e8e8e8,0_8px_15px_#00000005] min-[801px]:h-[60px] min-[801px]:gap-2 min-[801px]:py-2 min-[801px]:pl-4 min-[801px]:pr-5 min-[801px]:text-xl dark:from-[#2c2c2e] dark:via-[#232325] dark:to-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[1.25px_0_0_-.75px_#48484a,-1.25px_0_0_-.75px_#48484a,0_0_0_.5px_#3a3a3c,0_8px_15px_#00000005]"
              >
                <span aria-hidden className="inline-flex h-9 items-center min-[801px]:h-11 [&>svg]:h-full [&>svg]:w-auto">
                  {p.image}
                </span>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <style>{`@keyframes ihh-marquee{from{transform:translateX(0)}to{transform:translateX(calc(-1 * var(--ihh-w)))}}`}</style>
    </div>
  );
}
