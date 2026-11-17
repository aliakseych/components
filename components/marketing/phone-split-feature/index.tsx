import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PhoneSplitBullet = { icon?: ReactNode; text: ReactNode };

export type PhoneSplitFeatureProps = {
  title: ReactNode;
  description?: ReactNode;
  bullets?: PhoneSplitBullet[];
  cta?: { label: string; href: string };
  /** Screen content rendered inside the phone frame. */
  phone: ReactNode;
  /** Puts the phone panel before the text on wide screens. */
  reversed?: boolean;
  /** `top` hangs the phone 12.28% below the panel's top edge; `bottom` shows only the lower part of a phone that starts 59.4% above the panel. */
  phonePosition?: "top" | "bottom";
  /** Accessible label for the phone illustration. */
  phoneLabel?: string;
  /** Maximum parallax travel of the phone in px. */
  parallax?: number;
  className?: string;
};

const EASE = "cubic-bezier(.25,.1,.25,1)";

/**
 * Once-only scroll entrance (800ms text / 1000ms card, 18px / 32px rise, stagger delays) for every
 * `[data-reveal]` child. Triggers when an element crosses 35% up from the viewport bottom.
 */
function useEntrance(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-reveal]")];
    const play = (item: HTMLElement) => {
      if (!item.dataset.pending) return;
      delete item.dataset.pending;
      item.style.opacity = "";
      const card = item.dataset.card === "1";
      item.animate(
        [
          { opacity: 0, translate: card ? "0 32px" : "0 18px", scale: card ? "0.96" : "1" },
          { opacity: 1, translate: "0 0", scale: "1" },
        ],
        { duration: card ? 1000 : 800, delay: Number(item.dataset.delay ?? 0), easing: EASE, fill: "backwards" },
      );
    };
    items.forEach((item) => {
      item.dataset.pending = "1";
      item.style.opacity = "0";
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          // Reveal the whole group a trigger element owns (text column or visual).
          (e.target as HTMLElement).querySelectorAll<HTMLElement>("[data-reveal]").forEach(play);
          play(e.target as HTMLElement);
        }),
      { threshold: 0, rootMargin: `0px 0px -${Math.round(innerHeight * 0.35)}px 0px` },
    );
    el.querySelectorAll("[data-reveal-root]").forEach((r) => io.observe(r));
    const onFocus = (ev: FocusEvent) => items.forEach((i) => i.contains(ev.target as Node) && play(i));
    el.addEventListener("focusin", onFocus);
    return () => {
      io.disconnect();
      el.removeEventListener("focusin", onFocus);
      items.forEach((i) => {
        delete i.dataset.pending;
        i.style.opacity = "";
      });
    };
  }, [root]);
}

/** Scroll-linked phone drift: target = progress * travel, eased 12% per frame. */
function useParallax(visual: React.RefObject<HTMLElement | null>, phone: React.RefObject<HTMLElement | null>, travel: number) {
  useEffect(() => {
    const v = visual.current;
    const p = phone.current;
    if (!v || !p) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let frame = 0;
    const tick = () => {
      frame = 0;
      current += (target - current) * 0.12;
      let moving = true;
      if (Math.abs(target - current) <= 0.05) {
        current = target;
        moving = false;
      }
      p.style.transform = `translate3d(-50%,${current.toFixed(2)}px,0)`;
      if (moving) frame = requestAnimationFrame(tick);
    };
    const update = () => {
      const r = v.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - r.top - r.height / 2) / (innerHeight / 2 + r.height / 2)));
      target = reduced.matches ? 0 : progress * travel;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    reduced.addEventListener("change", update);
    update();
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      reduced.removeEventListener("change", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [visual, phone, travel]);
}

export type PhoneListRow = { title: string; meta: string; tone?: "ok" | "warn" | "bad" };

const toneDot = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500" };

/** Optional ready-made phone screen: a heading and a list of status rows. Scales with the phone width. */
export function PhoneListScreen({ heading, rows, anchor = "top" }: { heading: string; rows: PhoneListRow[]; anchor?: "top" | "bottom" }) {
  return (
    <div
      className={cn("flex h-full flex-col gap-[3cqw] px-[7%]", anchor === "top" ? "pt-[13%]" : "justify-end pb-[9%]")}
      style={{ containerType: "inline-size" }}
    >
      <p className="m-0 text-[4.6cqw] leading-tight font-semibold tracking-tight text-foreground">{heading}</p>
      <ul className="m-0 flex list-none flex-col gap-[2.6cqw] p-0">
        {rows.map((r) => (
          <li key={r.title} className="flex items-center gap-[3cqw] rounded-[4cqw] bg-muted px-[3.6cqw] py-[3cqw]">
            <span className={cn("size-[2.4cqw] flex-none rounded-full", toneDot[r.tone ?? "ok"])} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[3.5cqw] leading-tight font-medium text-foreground">{r.title}</span>
              <span className="block truncate text-[3cqw] leading-tight text-muted-foreground">{r.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PhoneSplitFeature({
  title,
  description,
  bullets = [],
  cta,
  phone,
  reversed = false,
  phonePosition = "top",
  phoneLabel,
  parallax = 24,
  className,
}: PhoneSplitFeatureProps) {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  useEntrance(root);
  useParallax(visual, phoneRef, parallax);

  return (
    <section
      ref={root}
      className={cn(
        "mx-auto flex w-full max-w-[1296px] flex-col items-stretch gap-10 px-5 py-20 text-foreground min-[381px]:px-6 min-[801px]:flex-row min-[801px]:items-end min-[801px]:gap-12 min-[801px]:px-8 min-[801px]:py-[144px] min-[1200px]:gap-[84px] min-[1200px]:px-12",
        className,
      )}
    >
      <div data-reveal-root className="flex min-w-0 flex-1 flex-col items-start gap-8 min-[801px]:gap-[42px] min-[1200px]:gap-16">
        <div>
          <h2
            data-reveal
            data-delay="0"
            className="m-0 text-[clamp(32px,7vw,44px)] leading-[1.08] font-[590] tracking-[-.23px] min-[801px]:text-[46px] min-[1200px]:text-[56px]"
          >
            {title}
          </h2>
          {description && (
            <p
              data-reveal
              data-delay="80"
              className="mt-4 text-[18px] leading-[25px] tracking-[-.26px] text-pretty text-muted-foreground min-[801px]:text-[20px] min-[1200px]:text-[22px] min-[1200px]:leading-7"
            >
              {description}
            </p>
          )}
        </div>
        {bullets.length > 0 && (
          <ul className="m-0 flex w-full list-none flex-col p-0">
            {bullets.map((b, i) => (
              <li
                key={i}
                data-reveal
                data-delay={160 + i * 60}
                className="relative flex items-center gap-3 py-[18px] text-[18px] leading-[25px] tracking-[-.45px] text-muted-foreground first:pt-0 last:pb-0 min-[801px]:text-[20px] not-last:after:absolute not-last:after:inset-x-0 not-last:after:bottom-0 not-last:after:h-px not-last:after:bg-border"
              >
                {b.icon && <span aria-hidden className="flex size-6 flex-none items-center justify-center [&>svg]:size-6">{b.icon}</span>}
                {b.text}
              </li>
            ))}
          </ul>
        )}
        {cta && (
          <a
            data-reveal
            data-delay="340"
            href={cta.href}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-foreground px-8 py-3 text-[17px] leading-[22px] font-[590] tracking-[-.43px] whitespace-nowrap text-background transition-[background-color,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 motion-reduce:[@media(hover:hover)_and_(pointer:fine)]:hover:translate-y-0"
          >
            {cta.label}
          </a>
        )}
      </div>

      <div
        ref={visual}
        data-reveal-root
        data-reveal
        data-card="1"
        data-delay="0"
        className={cn(
          "relative isolate aspect-square w-full max-w-[456px] flex-none self-center overflow-hidden rounded-[36px] bg-gradient-to-b from-[#082947] to-[#567594] max-[800px]:order-2 min-[801px]:w-[40%] min-[801px]:basis-[40%] min-[801px]:self-auto min-[1200px]:w-[456px] min-[1200px]:basis-[456px]",
          reversed && "min-[801px]:order-first",
        )}
      >
        <div
          ref={phoneRef}
          role={phoneLabel ? "img" : undefined}
          aria-label={phoneLabel}
          className={cn(
            "absolute left-1/2 w-[72.807%] will-change-transform",
            phonePosition === "top" ? "top-[12.2807%] aspect-[332/680]" : "top-[-59.376%] aspect-[332/680]",
          )}
          style={{ transform: "translate3d(-50%,0,0)" }}
        >
          <div
            className={cn(
              "absolute inset-0 overflow-hidden bg-neutral-900 p-[2.4%] shadow-[0_24px_60px_-12px_rgba(0,0,0,.45)] ring-1 ring-white/15",
              phonePosition === "top" ? "rounded-t-[14%] pb-0" : "rounded-b-[14%] pt-0",
            )}
          >
            <div
              className={cn(
                "h-full w-full overflow-hidden bg-card text-card-foreground",
                phonePosition === "top" ? "rounded-t-[12%]" : "rounded-b-[12%]",
              )}
            >
              {phone}
            </div>
          </div>
          {phonePosition === "top" && (
            <span aria-hidden className="absolute top-[2.6%] left-1/2 z-10 h-[2.6%] w-[26%] -translate-x-1/2 rounded-full bg-neutral-900" />
          )}
        </div>
      </div>
    </section>
  );
}
