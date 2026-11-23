"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CardsVisual, CourierVisual, LogoMark, MarketplaceVisual } from "./visuals";

export { CardsVisual, CourierVisual, MarketplaceVisual } from "./visuals";

export type ConnectionRow = {
  label: string;
  title: string;
  /** Small status next to the label, such as "Roadmap". */
  badge?: string;
  /** Image side; sized to max 360px wide. Use `<img className="h-auto w-full" />` or an SVG. */
  visual: ReactNode;
};

export type ConnectionLogo = {
  name: string;
  /** Rendered width in px at the 32px logo height. */
  width: number;
  /** Image URL; without it a neutral mark with the name is drawn. */
  src?: string;
};

export type PaymentDeliveryConnectionsColors = {
  /** Badge dot and text */
  badge?: string;
};

export type PaymentDeliveryConnectionsProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: string;
  description?: string;
  rows?: ConnectionRow[];
  logos?: ConnectionLogo[];
  /** Seconds for one marquee loop. */
  marqueeDuration?: number;
  colors?: PaymentDeliveryConnectionsColors;
};

const DEFAULT_ROWS: ConnectionRow[] = [
  { label: "Payment integrations", title: "Cards and wallets at checkout, set up for you.", visual: <CardsVisual /> },
  { label: "Logistics and courier", title: "Three courier partners, set up for how you ship.", visual: <CourierVisual /> },
  { label: "Marketplaces", badge: "Roadmap", title: "Four regional marketplaces kept in sync with your catalog", visual: <MarketplaceVisual /> },
];

const DEFAULT_LOGOS: ConnectionLogo[] = [
  { name: "Ledger", width: 65 },
  { name: "Orbit", width: 64 },
  { name: "Merchant", width: 87 },
  { name: "Metrics", width: 92 },
  { name: "Pixel", width: 124 },
  { name: "Atlas Search", width: 131 },
  { name: "Lend Later", width: 129 },
  { name: "Halo Pay", width: 132 },
];

const PALETTE: Record<string, string> = {
  "--pdc-card-1": "oklch(0.82 0.1 305)",
  "--pdc-card-2": "oklch(0.88 0.08 160)",
  "--pdc-card-3": "oklch(0.6 0.13 250)",
  "--pdc-card-4": "oklch(0.25 0 0)",
  "--pdc-card-ink": "oklch(0.98 0 0)",
  "--pdc-card-dark": "oklch(0.25 0 0)",
  "--pdc-card-accent": "oklch(0.5 0.24 285)",
  "--pdc-mark-a": "oklch(0.6 0.23 27)",
  "--pdc-mark-b": "oklch(0.78 0.16 70)",
  "--pdc-tile-1": "oklch(0.68 0.19 48)",
  "--pdc-tile-2": "oklch(0.88 0.17 95)",
  "--pdc-tile-3": "oklch(0.99 0 0)",
  "--pdc-tile-ink": "oklch(0.99 0 0)",
  "--pdc-tile-dark": "oklch(0.15 0 0)",
  "--pdc-tile-accent": "oklch(0.45 0.2 310)",
  "--pdc-stack-1": "oklch(0.45 0.25 285)",
  "--pdc-stack-2": "oklch(0.8 0.13 215)",
  "--pdc-stack-3": "oklch(0.7 0.2 45)",
  "--pdc-stack-front": "oklch(0.99 0 0)",
  "--pdc-stack-mark": "oklch(0.5 0.25 290)",
  "--pdc-shadow": "oklch(0.2 0 0)",
  "--pdc-logo-1": "oklch(0.55 0.2 265)",
  "--pdc-logo-2": "oklch(0.55 0.2 20)",
  "--pdc-logo-3": "oklch(0.6 0.15 150)",
  "--pdc-logo-4": "oklch(0.7 0.16 70)",
  "--pdc-logo-5": "oklch(0.5 0.2 310)",
};

/** Partner section: headline, three alternating image rows and an infinite logo marquee. */
export function PaymentDeliveryConnections({
  title = "Payments and delivery your customers already use.",
  description = "Local cards and regional couriers are available now. Three large marketplaces connect in a later step.",
  rows = DEFAULT_ROWS,
  logos = DEFAULT_LOGOS,
  marqueeDuration = 28,
  colors,
  className,
  style,
  ...rest
}: PaymentDeliveryConnectionsProps) {
  const ref = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-conn-heading] > *", {
        y: 48,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-conn-heading]", start: "top 80%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-conn-row]").forEach((row) => {
        gsap.from(row.querySelectorAll("[data-conn-cell]"), {
          y: 56,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 80%", once: true },
        });
      });
      const track = root.querySelector("[data-marquee-track]");
      if (track) tween.current = gsap.to(track, { xPercent: -50, duration: marqueeDuration * 2, ease: "none", repeat: -1 });
    }, root);
    return () => {
      tween.current = null;
      ctx.revert();
    };
  }, [marqueeDuration]);

  const vars = { ...PALETTE, "--pdc-badge": colors?.badge ?? "oklch(0.47 0.2 295)", ...style } as CSSProperties;
  const mask = "linear-gradient(90deg, transparent, black 12% 88%, transparent)";

  return (
    <section
      id="connections"
      ref={ref}
      {...rest}
      className={cn("relative z-0 overflow-hidden bg-background py-24 text-foreground lg:py-32", className)}
      style={vars}
    >
      <div data-conn-heading className="mx-auto w-full max-w-[1440px] px-6 text-center md:px-[90px]">
        <h2 className="mx-auto max-w-3xl text-[34px] leading-tight tracking-[-0.88px] sm:text-[44px] sm:leading-[48.4px]">{title}</h2>
        <p className="mx-auto max-w-2xl pt-4 text-lg leading-7 text-muted-foreground">{description}</p>
      </div>
      <div className="mx-auto mt-16 flex w-full max-w-[1440px] flex-col gap-16 px-6 md:px-[90px] lg:mt-20 lg:gap-20">
        {rows.map((row, i) => (
          <div
            key={row.title}
            data-conn-row
            className={cn("flex min-w-0 flex-col items-center gap-8 lg:gap-16", i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse")}
          >
            <div data-conn-cell className="flex w-full min-w-0 max-w-[440px] items-center justify-center p-10 lg:w-2/5">
              <div className="w-full max-w-[360px]">{row.visual}</div>
            </div>
            <div data-conn-cell className="w-full min-w-0 lg:w-3/5">
              <p className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                {row.label}
                {row.badge ? (
                  <span className="flex items-center gap-1.5 text-[var(--pdc-badge)]">
                    <span className="size-1.5 rounded-full bg-[var(--pdc-badge)]" />
                    {row.badge}
                  </span>
                ) : null}
              </p>
              <h3 className="max-w-xl pt-3 text-[28px] leading-snug tracking-[-0.64px] sm:text-[32px]">{row.title}</h3>
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-20 overflow-hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        onMouseEnter={() => tween.current?.pause()}
        onMouseLeave={() => tween.current?.play()}
      >
        <ul data-marquee-track className="flex w-max items-center gap-10 sm:gap-20" aria-label="Integrations">
          {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
            <li
              key={`${logo.name}-${i}`}
              aria-hidden={i >= logos.length || undefined}
              className="opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              style={{ width: logo.width, height: 32 }}
            >
              {logo.src ? <img src={logo.src} alt={logo.name} className="h-8 w-auto" style={{ height: 32 }} /> : <LogoMark name={logo.name} index={i % logos.length} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
