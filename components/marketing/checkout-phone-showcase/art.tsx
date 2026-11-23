import type { ReactNode } from "react";

export type GarmentKind = "tee" | "plaid" | "raglan" | "jeans";

const TEE = "M30 22 L50 12 Q60 24 70 12 L90 22 L110 50 L93 62 L88 54 L88 136 L32 136 L32 54 L27 62 L10 50 Z";

/** Neutral garment drawings used as default product imagery. Colours come from `--cps-garment-N`. */
export function Garment({ kind }: { kind: GarmentKind }): ReactNode {
  const common = { viewBox: "0 0 120 150", className: "h-full w-full", "aria-hidden": true } as const;
  if (kind === "tee")
    return (
      <svg {...common}>
        <path d={TEE} fill="var(--cps-garment-1)" />
        <rect x="52" y="52" width="16" height="2.5" rx="1" fill="var(--cps-paper)" opacity=".7" />
      </svg>
    );
  if (kind === "plaid")
    return (
      <svg {...common}>
        <defs>
          <pattern id="cps-plaid" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="var(--cps-garment-2)" />
            <rect width="14" height="4" y="3" fill="var(--cps-garment-2b)" opacity=".75" />
            <rect width="4" height="14" x="3" fill="var(--cps-garment-2b)" opacity=".75" />
          </pattern>
        </defs>
        <path d={TEE} fill="url(#cps-plaid)" />
        <path d="M50 12 L60 40 L70 12 Q60 24 50 12Z" fill="var(--cps-paper)" opacity=".85" />
        <path d="M60 40 V136" stroke="var(--cps-garment-1)" strokeWidth="1" opacity=".5" />
      </svg>
    );
  if (kind === "raglan")
    return (
      <svg {...common}>
        <defs>
          <pattern id="cps-stripe" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="var(--cps-garment-3)" />
            <rect width="2" height="6" x="4" fill="var(--cps-garment-3b)" opacity=".55" />
          </pattern>
        </defs>
        <path d={TEE} fill="var(--cps-garment-1)" />
        <path d="M44 15 L50 12 Q60 24 70 12 L76 15 L88 54 L88 136 L32 136 L32 54 Z" fill="url(#cps-stripe)" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M38 12 H82 L86 142 H64 L60 56 L56 142 H34 Z" fill="var(--cps-garment-4)" />
      <path d="M38 12 H82 L82.4 24 H37.6 Z" fill="var(--cps-garment-4b)" />
      <path d="M60 24 V58" stroke="var(--cps-garment-4b)" strokeWidth="1.2" />
    </svg>
  );
}
