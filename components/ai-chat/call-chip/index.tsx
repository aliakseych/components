import type { ComponentType, CSSProperties, ReactNode } from "react";
import CallChipRaw from "./CallChip.jsx";

export type CallChipProps = {
  icon?: "terminal" | "file" | "search" | "edit" | ReactNode;
  name?: string;
  argument?: string;
  status?: "running" | "done" | "error";
  /** Typical duration, used to pace the progress wash. */
  expectedMs?: number;
  size?: number;
  radius?: number;
  color?: string;
  surfaceColor?: string;
  progressColor?: string;
  progressOpacity?: number;
  doneColor?: string;
  errorColor?: string;
  washOpacity?: number;
  shake?: number;
  showTimer?: boolean;
  onRetry?: () => void;
  className?: string;
  style?: CSSProperties;
};

export const CallChip = CallChipRaw as unknown as ComponentType<CallChipProps>;
