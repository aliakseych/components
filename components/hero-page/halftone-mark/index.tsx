import type { ComponentType, CSSProperties } from "react";
import HalftoneMarkRaw from "./HalftoneMark.jsx";

export type HalftoneMarkProps = {
  /** URL of the image that gives the mark its shape. */
  src: string;
  /** Accessible name. Leave empty for a decorative mark. */
  label?: string;
  colors?: readonly string[];
  base?: string;
  innerGlow?: number;
  outerGlow?: number;
  contour?: number;
  angle?: number;
  noise?: number;
  speed?: number;
  className?: string;
  style?: CSSProperties;
};

export const HalftoneMark = HalftoneMarkRaw as unknown as ComponentType<HalftoneMarkProps>;
