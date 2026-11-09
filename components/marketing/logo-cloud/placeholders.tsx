import type { ReactNode } from "react";
import type { LogoItem } from "./index";

type Mark = "circle" | "square" | "triangle" | "diamond" | "bars" | "none";

type WordStyle = {
  size: number;
  weight: number;
  tracking?: number;
  italic?: boolean;
  upper?: boolean;
};

// Placeholder marks use currentColor, so they follow the cell's text colour.
const shapes: Record<Exclude<Mark, "none">, ReactNode> = {
  circle: <circle cx="11" cy="16" r="9" />,
  square: <rect x="2" y="7" width="18" height="18" rx="3" />,
  triangle: <polygon points="11,6 21,26 1,26" />,
  diamond: <polygon points="11,5 22,16 11,27 0,16" />,
  bars: (
    <>
      <rect x="0" y="6" width="20" height="5" rx="1" />
      <rect x="0" y="14" width="13" height="5" rx="1" />
      <rect x="0" y="22" width="20" height="5" rx="1" />
    </>
  ),
};

function wordmark(name: string, mark: Mark, style: WordStyle) {
  const offset = mark === "none" ? 0 : 30;
  return (
    <svg
      viewBox="0 0 150 32"
      className="h-6 w-auto max-w-full"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {mark !== "none" && shapes[mark]}
      <text
        x={offset}
        y="22"
        fontFamily="inherit"
        fontSize={style.size}
        fontWeight={style.weight}
        fontStyle={style.italic ? "italic" : "normal"}
        letterSpacing={style.tracking ?? 0}
      >
        {style.upper ? name.toUpperCase() : name}
      </text>
    </svg>
  );
}

function item(name: string, mark: Mark, style: WordStyle): LogoItem {
  return { name, node: wordmark(name, mark, style) };
}

// Placeholder names and drawings only. Never use real brand logos here.
export const placeholderLogos: LogoItem[] = [
  item("Northwind", "circle", { size: 17, weight: 300 }),
  item("Acme", "none", { size: 18, weight: 800, tracking: -0.5 }),
  item("Shapeline", "square", { size: 16, weight: 600 }),
  item("Lumen", "triangle", { size: 16, weight: 500, italic: true }),
  item("Harbor", "bars", { size: 13, weight: 700, tracking: 2, upper: true }),
  item("Kestrel", "diamond", { size: 16, weight: 600 }),
  item("Fieldstone", "none", { size: 16, weight: 400, tracking: 0.5 }),
  item("Quill", "circle", { size: 17, weight: 700, italic: true }),
];
