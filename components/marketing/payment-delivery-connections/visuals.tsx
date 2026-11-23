import type { ReactNode } from "react";

const shadow = { filter: "drop-shadow(0 3px 6px color-mix(in oklab, var(--pdc-shadow) 22%, transparent))" } as const;

/** Four fanned bank-card shapes with neutral marks. */
export function CardsVisual(): ReactNode {
  return (
    <svg viewBox="0 0 592 379" className="h-auto w-full" aria-hidden style={shadow}>
      <rect x="296" y="31" width="268" height="168" rx="10" fill="var(--pdc-card-4)" />
      <rect x="440" y="150" width="90" height="16" rx="3" fill="var(--pdc-card-ink)" opacity=".9" />
      <rect x="207" y="78" width="268" height="168" rx="10" fill="var(--pdc-card-3)" />
      <circle cx="392" cy="212" r="17" fill="var(--pdc-mark-a)" />
      <circle cx="414" cy="212" r="17" fill="var(--pdc-mark-b)" opacity=".9" />
      <rect x="118" y="125" width="268" height="168" rx="10" fill="var(--pdc-card-2)" />
      <rect x="296" y="246" width="56" height="30" rx="5" fill="var(--pdc-card-dark)" />
      <rect x="304" y="256" width="30" height="4" rx="2" fill="var(--pdc-card-ink)" />
      <rect x="304" y="264" width="20" height="4" rx="2" fill="var(--pdc-card-ink)" opacity=".6" />
      <rect x="30" y="172" width="268" height="168" rx="10" fill="var(--pdc-card-1)" />
      <rect x="196" y="304" width="76" height="16" rx="4" fill="var(--pdc-card-accent)" />
    </svg>
  );
}

/** Three rounded courier-brand tiles with neutral marks. */
export function CourierVisual(): ReactNode {
  return (
    <svg viewBox="0 0 650 416" className="h-auto w-full" aria-hidden style={shadow}>
      <rect x="16" y="85" width="196" height="225" rx="18" fill="var(--pdc-tile-1)" />
      <rect x="44" y="172" width="104" height="22" rx="5" fill="var(--pdc-tile-ink)" />
      <rect x="156" y="160" width="34" height="34" rx="4" fill="var(--pdc-tile-ink)" opacity=".7" />
      <rect x="44" y="206" width="110" height="7" rx="3" fill="var(--pdc-tile-ink)" opacity=".6" />
      <rect x="227" y="85" width="196" height="225" rx="18" fill="var(--pdc-tile-2)" />
      <rect x="252" y="180" width="110" height="24" rx="6" fill="var(--pdc-tile-dark)" />
      <rect x="360" y="172" width="38" height="30" rx="8" fill="var(--pdc-tile-dark)" transform="skewX(-12) translate(42 0)" />
      <rect x="437" y="85" width="196" height="225" rx="18" fill="var(--pdc-tile-3)" />
      <path d="M470 168 q40 -52 80 0" fill="none" stroke="var(--pdc-tile-accent)" strokeWidth="14" strokeLinecap="round" />
      <path d="M440 304 Q540 230 633 210 V292 a18 18 0 0 1 -18 18 H455 a18 18 0 0 1 -15 -6Z" fill="var(--pdc-tile-accent)" opacity=".85" />
      <rect x="472" y="204" width="110" height="7" rx="3" fill="var(--pdc-tile-accent)" />
    </svg>
  );
}

/** A marketplace app icon in front of three tilted tiles. */
export function MarketplaceVisual(): ReactNode {
  return (
    <svg viewBox="0 0 592 380" className="h-auto w-full" aria-hidden style={shadow}>
      <rect x="196" y="82" width="190" height="190" rx="36" fill="var(--pdc-stack-1)" transform="rotate(-6 291 177)" />
      <rect x="214" y="62" width="190" height="190" rx="36" fill="var(--pdc-stack-2)" transform="rotate(4 309 157)" />
      <rect x="232" y="72" width="190" height="190" rx="36" fill="var(--pdc-stack-3)" transform="rotate(-2 327 167)" />
      <rect x="215" y="88" width="184" height="190" rx="40" fill="var(--pdc-stack-front)" />
      <path d="M270 150 v34 a37 37 0 0 0 74 0 v-34" fill="none" stroke="var(--pdc-stack-mark)" strokeWidth="18" strokeLinecap="round" />
      <path d="M307 130 v36" stroke="var(--pdc-stack-mark)" strokeWidth="18" strokeLinecap="round" />
    </svg>
  );
}

/** Neutral partner mark for the marquee: a glyph and the name. */
export function LogoMark({ name, index }: { name: string; index: number }): ReactNode {
  const color = `var(--pdc-logo-${(index % 5) + 1})`;
  const shapes = [
    <circle key="c" cx="12" cy="12" r="10" fill={color} />,
    <rect key="r" x="2" y="2" width="20" height="20" rx="5" fill={color} />,
    <path key="t" d="M12 2 22 21 H2Z" fill={color} />,
    <path key="h" d="M12 1.5 21 6.7v10.6L12 22.5 3 17.3V6.7Z" fill={color} />,
    <path key="d" d="M12 1 23 12 12 23 1 12Z" fill={color} />,
  ];
  return (
    <span className="inline-flex h-8 items-center gap-1.5">
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
        {shapes[index % shapes.length]}
      </svg>
      <span className="text-[15px] leading-none font-semibold tracking-tight whitespace-nowrap">{name}</span>
    </span>
  );
}
