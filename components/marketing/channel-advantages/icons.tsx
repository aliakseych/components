import type { ReactNode } from "react";

const glyphs: ReactNode[] = [
  <path key="store" d="M4 9.5 5.5 4h13L20 9.5M4 9.5c0 1.4 1.1 2.5 2.5 2.5S9 10.9 9 9.5c0 1.4 1.1 2.5 2.5 2.5h1c1.4 0 2.5-1.1 2.5-2.5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5M5.5 12v8h13v-8" />,
  <path key="card" d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2zM3.5 10h17M7 15h4" />,
  <path key="layers" d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8zM3.5 12.2 12 16.7l8.5-4.5M3.5 16 12 20.5l8.5-4.5" />,
  <path key="link" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  <path key="chart" d="M4 19.5h16M6.5 16v-4M11 16V7.5M15.5 16v-6M20 16V5" />,
  <path key="tool" d="M14.5 5.5a4.5 4.5 0 0 0 4.7 5.9L10.2 20.4a2.1 2.1 0 0 1-3-3l9-9a4.5 4.5 0 0 0-1.7-2.9z" />,
];

/** 64px round glyph in the sky colour; `index` picks one of six neutral drawings. */
export function AdvantageIcon({ index }: { index: number }): ReactNode {
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="var(--cha-sky)" />
      <g transform="translate(16 16) scale(1.333)" fill="none" stroke="var(--cha-surface)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {glyphs[index % glyphs.length]}
      </g>
    </svg>
  );
}
