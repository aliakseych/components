import type { ComponentType, CSSProperties } from "react";
import LatticeLoaderRaw from "./LatticeLoader.jsx";

export type LatticePattern =
  | "arrow" | "dots" | "ripple" | "spiral" | "orbit"
  | "snake" | "sweep" | "spin" | "rain" | "pulse";

export type LatticeLoaderProps = {
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  status?: "working" | "done" | "error";
  /** A named pattern, or custom cell delays. Some names exist for only one grid size. */
  pattern?: LatticePattern | { cells: (number | null)[]; loop?: number; scale?: number; lit?: number };
  grid?: 3 | 4;
  shape?: "round" | "square";
  color?: string;
  doneColor?: string;
  errorColor?: string;
  cellSize?: number;
  gap?: number;
  fontSize?: number;
  step?: number;
  idleOpacity?: number;
  glow?: boolean;
  glowColor?: string;
  showTimer?: boolean;
  /** Fixed time in seconds. Leave unset to count automatically. */
  elapsed?: number;
  className?: string;
  style?: CSSProperties;
};

export const LatticeLoader = LatticeLoaderRaw as unknown as ComponentType<LatticeLoaderProps>;
