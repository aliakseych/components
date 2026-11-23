"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AdvantageIcon } from "./icons";

export { AdvantageIcon } from "./icons";

export type ChannelAdvantage = {
  title: string;
  body: string;
  /** Replaces the built-in 64px icon. */
  icon?: ReactNode;
};

export type ChannelStat = {
  value: string;
  label: string;
  description: string;
};

export type ChannelAdvantagesColors = {
  /** Section background */
  surface?: string;
  /** Eyebrow, icon discs */
  sky?: string;
  /** Blue light in the lower-left corner */
  glow?: string;
};

export type ChannelAdvantagesProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: ChannelAdvantage[];
  /** Three tiles under the grid; their lower part sits over the page background. */
  stats?: ChannelStat[];
  colors?: ChannelAdvantagesColors;
};

const DEFAULT_ITEMS: ChannelAdvantage[] = [
  { title: "Your own channel", body: "Sell on your site and on socials. Those orders pay no marketplace commission." },
  { title: "Local checkout", body: "Cards and instalments at checkout, so more orders get finished." },
  { title: "One admin", body: "One catalog and one order queue. No copying orders between dashboards." },
  { title: "Marketplaces too", body: "Sync with three large marketplaces is on the roadmap, beside your store and socials." },
  { title: "Economics first", body: "We compare marketplace fees and direct-channel costs before we propose the build." },
  { title: "Set up locally", body: "We configure payments, delivery, and fiscalization within your project scope." },
];

const DEFAULT_STATS: ChannelStat[] = [
  { value: "Agreed", label: "Setup fee", description: "One-time fee, set in the proposal" },
  { value: "Scope", label: "Operations", description: "Support and fees — in the proposal" },
  { value: "Phased", label: "Handover", description: "Discover, launch, then hand over" },
];

const TILE_BG = [
  "linear-gradient(120deg, var(--cha-tile-1a) 0%, var(--cha-tile-1b) 55%, var(--cha-sky) 100%)",
  "linear-gradient(120deg, var(--cha-tile-2a) 0%, var(--cha-tile-2b) 60%, var(--cha-tile-2c) 100%)",
  "linear-gradient(120deg, var(--cha-tile-3a) 0%, var(--cha-tile-3b) 50%, var(--cha-tile-3c) 100%)",
];

/** Dark benefits module: heading, six icon columns, a corner glow and three gradient stat tiles with scroll-in reveals. */
export function ChannelAdvantages({
  eyebrow = "Platform advantages",
  title = "Run every channel from one place",
  description = "Your store, socials, and marketplaces share one catalog, one order queue, and your customers.",
  items = DEFAULT_ITEMS,
  stats = DEFAULT_STATS,
  colors,
  className,
  style,
  ...rest
}: ChannelAdvantagesProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-adv-heading] > *", {
        y: 24,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-adv-heading]", start: "top 80%", once: true },
      });
      gsap.from("[data-adv-copy]", {
        y: 16,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: "[data-adv-grid]", start: "top 85%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-stat-tile]").forEach((tile, i) => {
        gsap.from(tile, {
          y: 80,
          autoAlpha: 0,
          duration: 1,
          delay: 0.12 * i,
          ease: "power3.out",
          scrollTrigger: { trigger: tile, start: "top 88%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const vars = {
    "--cha-surface": colors?.surface ?? "oklch(0.21 0.034 264)",
    "--cha-sky": colors?.sky ?? "oklch(0.82 0.08 235)",
    "--cha-glow": colors?.glow ?? "oklch(0.5 0.27 263)",
    "--cha-tile-1a": "oklch(0.7 0.08 235)",
    "--cha-tile-1b": "oklch(0.77 0.08 235)",
    "--cha-tile-2a": "oklch(0.72 0.08 235)",
    "--cha-tile-2b": "oklch(0.79 0.08 235)",
    "--cha-tile-2c": "oklch(0.83 0.08 235)",
    "--cha-tile-3a": "oklch(0.79 0.08 235)",
    "--cha-tile-3b": "oklch(0.83 0.08 235)",
    "--cha-tile-3c": "oklch(0.87 0.07 235)",
    ...style,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      {...rest}
      className={cn("relative z-10 overflow-hidden text-white", className)}
      style={{ ...vars, backgroundColor: "var(--cha-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[400px] -left-[420px] z-0 h-[900px] w-[980px]"
        style={{
          filter: "blur(80px)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--cha-glow) 55%, transparent) 0%, color-mix(in oklab, var(--cha-glow) 35%, transparent) 30%, color-mix(in oklab, var(--cha-sky) 12%, transparent) 62%, transparent 78%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pt-28 md:px-[90px]">
        <div data-adv-heading className="max-w-[940px]">
          <p className="pb-2 text-base font-medium tracking-[-0.16px] text-[var(--cha-sky)] uppercase">{eyebrow}</p>
          <h2 className="text-[36px] leading-tight tracking-[-0.96px] text-white sm:text-[48px] sm:leading-[56px]">{title}</h2>
          <p className="pt-4 text-xl leading-7 font-light text-white/60">{description}</p>
        </div>
        <div data-adv-grid className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.title} className="relative z-10 flex min-w-0 flex-col gap-6">
              {item.icon ?? <AdvantageIcon index={i} />}
              <div data-adv-copy>
                <h3 className="text-2xl tracking-[-0.48px] text-white">{item.title}</h3>
                <p className="pt-2 text-lg leading-[25.2px] font-light text-white/60">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="relative mt-20 pb-0">
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-background" />
        <div className="relative mx-auto grid w-full max-w-[1440px] gap-0 px-6 pb-16 md:px-[90px] lg:grid-cols-3 lg:gap-4">
          {stats.map((stat, i) => (
            <div key={stat.label} data-stat-tile className="flex min-w-0 flex-col p-8 text-black lg:px-6 xl:p-8" style={{ background: TILE_BG[i % TILE_BG.length] }}>
              <p className="text-[40px] leading-none">{stat.value}</p>
              <p className="pt-2 text-2xl tracking-[-0.48px]">{stat.label}</p>
              <p className="pt-2 text-lg font-light text-black/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
