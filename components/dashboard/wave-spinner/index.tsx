import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type WaveSpinnerPattern = "diagonal" | "center" | "plus";

export type WaveSpinnerProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  /** Grid rows. Ignored by `plus`, which is always 3 by 3. */
  rows?: number;
  /** Grid columns. Ignored by `plus`, which is always 3 by 3. */
  cols?: number;
  /** Width and height of one cell in pixels. */
  size?: number;
  /** Space between cells in pixels. */
  gap?: number;
  /**
   * `diagonal` sweeps from the top-left corner. `center` ripples out from the
   * middle. `plus` is 3 by 3 with the corners hidden, rippling out from the centre.
   */
  pattern?: WaveSpinnerPattern;
  /** Seconds for one pulse of a cell. */
  duration?: number;
  /** Seconds between neighbouring steps of the wave. */
  step?: number;
  /** `[from, to]`. Each cell fades from `from` to `to` as the wave passes. */
  colors?: [string, string];
  /** Screen reader text announced while loading. */
  label?: string;
};

const KEYFRAMES_NAME = "wave-spinner-pulse";

const waveStyles = `
.wave-spinner-cell {
  opacity: 0.3;
  transform: scale(0.8);
  background-color: var(--wave-spinner-from);
  animation: ${KEYFRAMES_NAME} var(--wave-spinner-duration) ease-out infinite both;
}
@keyframes ${KEYFRAMES_NAME} {
  0%, 100% { opacity: 0.3; transform: scale(0.8); background-color: var(--wave-spinner-from); }
  50% { opacity: 1; transform: scale(1); background-color: var(--wave-spinner-to); }
}
@media (prefers-reduced-motion: reduce) {
  .wave-spinner-cell {
    animation: none;
    opacity: 0.65;
    transform: scale(0.9);
    background-color: color-mix(in srgb, var(--wave-spinner-from) 50%, var(--wave-spinner-to));
  }
}
`;

/**
 * A grid of squares that pulse in a wave. Each cell fades between two colours
 * and its delay comes from its distance along the pattern, so the wave reads
 * as a colour sweep. The spinner announces itself with `role="status"`.
 */
export function WaveSpinner({
  rows = 4,
  cols = 4,
  size = 10,
  gap = 4,
  pattern = "diagonal",
  duration = 0.7,
  step = 0.12,
  colors = ["var(--muted-foreground)", "var(--primary)"],
  label = "Loading",
  className,
  style,
  ...props
}: WaveSpinnerProps) {
  const gridRows = pattern === "plus" ? 3 : rows;
  const gridCols = pattern === "plus" ? 3 : cols;
  const centerRow = (gridRows - 1) / 2;
  const centerCol = (gridCols - 1) / 2;

  const cells = Array.from({ length: gridRows * gridCols }, (_, index) => {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    const chebyshev = Math.max(Math.abs(row - centerRow), Math.abs(col - centerCol));
    if (pattern === "diagonal") return { key: index, delay: row + col };
    if (pattern === "plus" && row !== 1 && col !== 1) return { key: index, delay: null };
    return { key: index, delay: chebyshev };
  });

  const width = gridCols * size + (gridCols - 1) * gap;
  const height = gridRows * size + (gridRows - 1) * gap;

  return (
    <span
      role="status"
      className={cn("inline-block shrink-0", className)}
      style={{
        "--wave-spinner-from": colors[0],
        "--wave-spinner-to": colors[1],
        "--wave-spinner-duration": `${duration}s`,
        ...style,
      } as CSSProperties}
      {...props}
    >
      <style>{waveStyles}</style>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="grid"
        style={{
          width,
          height,
          gridTemplateColumns: `repeat(${gridCols}, ${size}px)`,
          gridTemplateRows: `repeat(${gridRows}, ${size}px)`,
          gap,
        }}
      >
        {cells.map(({ key, delay }) =>
          delay === null ? (
            <span key={key} />
          ) : (
            <span
              key={key}
              className="wave-spinner-cell rounded-[2px]"
              style={{ animationDelay: `${delay * step}s` }}
            />
          ),
        )}
      </span>
    </span>
  );
}
