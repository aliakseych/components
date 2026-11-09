import type { ComponentType } from "react";

interface LatticeLoaderProps {
  status?: "working" | "done" | "error";
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  showTimer?: boolean;
  cellSize?: number;
  gap?: number;
  color?: string;
  doneColor?: string;
  glow?: boolean;
  glowColor?: string;
}

declare const LatticeLoader: ComponentType<LatticeLoaderProps>;
export default LatticeLoader;
