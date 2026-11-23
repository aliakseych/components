// Neutral placeholder imagery. Each piece has the aspect ratio of the reference image it stands in for.
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

export function WarehouseArt(props: Props) {
  return (
    <svg viewBox="0 0 321 477" role="img" aria-label="Storage shelves" {...props}>
      <defs>
        <linearGradient id="wh-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c8aa0" />
          <stop offset="1" stopColor="#2d4152" />
        </linearGradient>
      </defs>
      <rect width="321" height="477" fill="url(#wh-bg)" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={14 + col * 100} y={20 + row * 112} width={88} height={84} rx="4" fill={(row + col) % 2 ? "#c9a46c" : "#b48d55"} opacity={0.85} />
        )),
      )}
      {[0, 1, 2, 3, 4].map((row) => (
        <rect key={row} x="0" y={106 + row * 112 - 6} width="321" height="6" fill="#1b2a36" opacity="0.7" />
      ))}
    </svg>
  );
}

export function ProductCardArt(props: Props) {
  return (
    <svg viewBox="0 0 220 305" role="img" aria-label="Product card" {...props}>
      <rect width="220" height="305" fill="#fff" />
      <rect x="10" y="10" width="200" height="190" rx="6" fill="#ececec" />
      <path d="M70 60l28-12c4 10 20 10 24 0l28 12 16 34-24 10v52H78v-52l-24-10z" fill="#23262b" />
      <rect x="10" y="214" width="120" height="9" rx="3" fill="#1d2025" />
      <rect x="10" y="232" width="70" height="7" rx="3" fill="#f5a623" />
      <rect x="86" y="232" width="24" height="7" rx="3" fill="#b8bcc4" />
      <rect x="10" y="254" width="42" height="11" rx="3" fill="#1d2025" />
    </svg>
  );
}

export function SofaArt(props: Props) {
  return (
    <svg viewBox="0 0 165 165" role="img" aria-label="Sofa" {...props}>
      <rect width="165" height="165" fill="#f3f1ec" />
      <rect x="30" y="52" width="105" height="46" rx="10" fill="#3f6a4a" />
      <rect x="18" y="72" width="30" height="48" rx="10" fill="#335a3d" />
      <rect x="117" y="72" width="30" height="48" rx="10" fill="#335a3d" />
      <rect x="40" y="86" width="85" height="34" rx="8" fill="#4a7a56" />
      <rect x="34" y="122" width="6" height="14" fill="#6b5a45" />
      <rect x="125" y="122" width="6" height="14" fill="#6b5a45" />
    </svg>
  );
}

const themeAccents = ["#2f6fed", "#d6406a", "#2a9d8f", "#e0a030", "#7a5af8"];

/** Storefront wireframe used for the theme strip. `ratio` = height / width of the reference screenshot. */
export function ThemeArt({ accent = 0, ratio = 1.268, ...props }: Props & { accent?: number; ratio?: number }) {
  const h = Math.round(320 * ratio);
  const color = themeAccents[accent % themeAccents.length];
  return (
    <svg viewBox={`0 0 320 ${h}`} role="img" aria-label="Storefront theme preview" preserveAspectRatio="xMidYMin slice" {...props}>
      <rect width="320" height={h} fill="#fff" />
      <rect width="320" height="26" fill="#f4f5f7" />
      <rect x="12" y="9" width="40" height="8" rx="3" fill="#1d2025" />
      <rect x="230" y="9" width="78" height="8" rx="3" fill="#c5c9d0" />
      <rect x="12" y="38" width="296" height="92" rx="8" fill={color} opacity="0.9" />
      <rect x="26" y="58" width="120" height="12" rx="4" fill="#fff" />
      <rect x="26" y="78" width="84" height="7" rx="3" fill="#fff" opacity="0.7" />
      <rect x="26" y="98" width="50" height="14" rx="7" fill="#fff" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} transform={`translate(${12 + (i % 4) * 75} ${146 + Math.floor(i / 4) * 96})`}>
          <rect width="66" height="62" rx="6" fill={i % 3 === 0 ? color : "#e8eaee"} opacity={i % 3 === 0 ? 0.35 : 1} />
          <rect y="68" width="48" height="6" rx="3" fill="#1d2025" />
          <rect y="80" width="28" height="6" rx="3" fill="#b8bcc4" />
        </g>
      ))}
      <rect x="12" y="346" width="296" height="6" rx="3" fill="#eceef1" />
    </svg>
  );
}

export function CardsArt(props: Props) {
  return (
    <svg viewBox="0 0 296 190" role="img" aria-label="Payment cards" {...props}>
      {[
        { x: 8, y: 94, c: "#c4a6f2" },
        { x: 56, y: 56, c: "#9bd4b2" },
        { x: 104, y: 18, c: "#5b8def" },
        { x: 152, y: 0, c: "#2a2d33" },
      ].map((card, i) => (
        <g key={i}>
          <rect x={card.x} y={card.y} width="120" height="76" rx="9" fill={card.c} />
          <rect x={card.x + 12} y={card.y + 50} width="32" height="7" rx="3" fill="#fff" opacity="0.7" />
        </g>
      ))}
      <circle cx="262" cy="30" r="9" fill="#e5484d" opacity="0.9" />
      <circle cx="274" cy="30" r="9" fill="#f5a623" opacity="0.9" />
    </svg>
  );
}

export function CouriersArt(props: Props) {
  return (
    <svg viewBox="0 -31 300 192" role="img" aria-label="Courier partners" {...props}>
      {[
        { x: 0, c: "#f2701d" },
        { x: 102, c: "#f5c518" },
        { x: 204, c: "#ffffff" },
      ].map(({ x, c }, i) => (
        <g key={i}>
          <rect x={x} y="0" width="96" height="130" rx="9" fill={c} stroke={i === 2 ? "#e5e7eb" : "none"} />
          <rect x={x + 16} y="46" width="64" height="12" rx="4" fill={i === 2 ? "#7a5af8" : "#fff"} opacity="0.9" />
          <rect x={x + 26} y="70" width="44" height="7" rx="3" fill={i === 2 ? "#7a5af8" : "#fff"} opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

export function AppIconArt(props: Props) {
  return (
    <svg viewBox="0 63 400 257" role="img" aria-label="Marketplace app icon" {...props}>
      <defs>
        <linearGradient id="ai-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a5af8" />
          <stop offset="0.5" stopColor="#ef5a7a" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <rect x="110" y="96" width="190" height="190" rx="40" fill="url(#ai-ring)" transform="rotate(-8 205 191)" />
      <rect x="120" y="110" width="170" height="170" rx="36" fill="#fff" />
      <circle cx="205" cy="195" r="34" fill="#7a5af8" />
      <circle cx="205" cy="195" r="14" fill="#fff" />
    </svg>
  );
}

/** Grey partner mark standing in for a real logo; `w`/`h` match the reference logo at 32px height. */
export function PartnerMark({ index, ...props }: Props & { index: number }) {
  const w = [66, 64, 88, 74, 84, 130, 76, 132][index % 8];
  return (
    <svg viewBox={`0 0 ${w} 32`} width={w} height={32} role="img" aria-label={`Partner ${index + 1}`} {...props}>
      <rect width="22" height="22" y="5" rx="6" fill="#6b7280" />
      <rect x="30" y="8" width={w - 34} height="7" rx="3" fill="#6b7280" />
      <rect x="30" y="19" width={Math.max(14, w - 54)} height="6" rx="3" fill="#9ca3af" />
    </svg>
  );
}

export function DiagramArt(props: Props) {
  const node = (x: number, y: number, c: string, key: string) => (
    <g key={key}>
      <rect x={x} y={y} width="44" height="36" rx="6" fill="#fff" stroke="#e5e7eb" />
      <circle cx={x + 22} cy={y + 14} r="7" fill={c} />
      <rect x={x + 9} y={y + 26} width="26" height="4" rx="2" fill="#c5c9d0" />
    </g>
  );
  const row1 = ["#7a5af8", "#2f6fed", "#e5484d", "#d6409f"];
  const row2 = ["#2a9d8f", "#f5a623", "#2f6fed", "#e5484d", "#1d2025"];
  return (
    <svg viewBox="0 -48 400 316" role="img" aria-label="Diagram: one catalog connected to sales channels and tools" {...props}>
      <g stroke="#c5c9d0" fill="none">
        <path d="M200 44v22M60 66h280M60 66v14M148 66v14M236 66v14M324 66v14" />
        <path d="M200 124v14M44 138h312M44 138v10M122 138v10M200 138v10M278 138v10M356 138v10" />
        <path d="M60 116v22M324 116v22" />
      </g>
      <rect x="178" y="8" width="44" height="40" rx="8" fill="#14507f" />
      <circle cx="200" cy="28" r="9" fill="#fff" />
      {row1.map((c, i) => node(38 + i * 88, 80, c, `a${i}`))}
      {row2.map((c, i) => node(22 + i * 78, 148, c, `b${i}`))}
    </svg>
  );
}

export function PhotoArt({ tone = 0, ...props }: Props & { tone?: number }) {
  const tones = [
    ["#b9c0c8", "#8a939d"],
    ["#d9c9b2", "#b79f7c"],
  ][tone % 2];
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label="Placeholder photo" preserveAspectRatio="xMidYMid slice" {...props}>
      <defs>
        <linearGradient id={`ph-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tones[0]} />
          <stop offset="1" stopColor={tones[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#ph-${tone})`} />
      <rect x="60" y="130" width="130" height="80" rx="4" fill="#c79a5e" />
      <rect x="205" y="100" width="100" height="110" rx="4" fill="#d8ab6f" />
      <rect x="40" y="206" width="320" height="10" rx="5" fill="#000" opacity="0.18" />
    </svg>
  );
}

export function PortraitArt(props: Props) {
  return (
    <svg viewBox="0 0 320 400" role="img" aria-label="Customer portrait placeholder" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="320" height="400" fill="#e6e6e6" />
      <circle cx="160" cy="150" r="58" fill="#c9b8a6" />
      <path d="M80 400c0-90 36-130 80-130s80 40 80 130z" fill="#1d2025" />
    </svg>
  );
}

/** Generic social glyphs (rounded squares) so the footer carries no brand marks. */
export function SocialGlyph({ kind, ...props }: Props & { kind: number }) {
  const shapes = [
    <rect key="a" x="9" y="9" width="14" height="14" rx="3" />,
    <circle key="b" cx="16" cy="16" r="7" />,
    <path key="c" d="M8 16l16-7-5 14-3-5z" />,
    <path key="d" d="M13 10l9 6-9 6z" />,
    <path key="e" d="M9 9l14 14M23 9L9 23" stroke="currentColor" strokeWidth="3" fill="none" />,
  ];
  return (
    <svg viewBox="0 0 32 32" aria-hidden {...props}>
      <circle cx="16" cy="16" r="16" fill="#fff" />
      <g fill="#02090a">{shapes[kind % shapes.length]}</g>
    </svg>
  );
}
