import { useId } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Colour roles. Each is any CSS colour. */
export type GooeyLoaderColors = {
  /** The circles. Overrides `color` when set. Default `var(--primary)`. */
  accent?: string;
};

export type GooeyLoaderProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** Diameter of each of the three circles in pixels. */
  size?: number;
  /** Space between circles in pixels. */
  gap?: number;
  /** Any CSS colour for the circles. */
  color?: string;
  /** Alias for `color` as a colour role: `colors.accent` wins over `color`. */
  colors?: GooeyLoaderColors;
  /** Seconds for one full swing of a circle. */
  speed?: number;
  /** Screen reader text announced while loading. */
  label?: string;
};

const KEYFRAMES_NAME = "gooey-loader-swing";

const blobStyles = `
.gooey-loader-blob {
  flex: none;
  width: var(--gooey-loader-size);
  height: var(--gooey-loader-size);
  border-radius: 9999px;
  background: currentColor;
  animation: ${KEYFRAMES_NAME} var(--gooey-loader-speed) cubic-bezier(0.37, 0, 0.63, 1) infinite;
}
@keyframes ${KEYFRAMES_NAME} {
  0%, 50%, 100% { transform: translateX(0) scale(1); }
  25% { transform: translateX(var(--gooey-loader-travel)) scale(1.2); }
  75% { transform: translateX(calc(var(--gooey-loader-travel) * -1)) scale(1.2); }
}
@media (prefers-reduced-motion: reduce) {
  .gooey-loader-blob {
    animation: none;
  }
}
`;

/**
 * Three circles swing side to side, merge and separate. An SVG filter (blur,
 * then a colour matrix that thresholds the alpha) makes them look gooey where
 * they meet. Each circle is offset in time, so the group ripples.
 */
export function GooeyLoader({
  size = 20,
  gap = 4,
  color = "var(--primary)",
  colors,
  speed = 1.4,
  label = "Loading",
  className,
  style,
  ...props
}: GooeyLoaderProps) {
  const filterId = `gooey-loader-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // 15px of travel at the default 20px size, scaled with size.
  const travel = size * 0.75;

  return (
    <div
      role="status"
      className={cn("inline-block shrink-0", className)}
      style={{
        ["--gooey-loader-accent" as string]: colors?.accent ?? color,
        color: "var(--gooey-loader-accent)",
        ...style,
        ["--gooey-loader-size" as string]: `${size}px`,
        ["--gooey-loader-speed" as string]: `${speed}s`,
        ["--gooey-loader-travel" as string]: `${travel}px`,
      } as CSSProperties}
      {...props}
    >
      <style>{blobStyles}</style>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" mode="normal" />
          </filter>
        </defs>
      </svg>
      <div aria-hidden="true" className="flex items-center" style={{ gap, filter: `url(#${filterId})` }}>
        {[0, 1, 2].map((index) => (
          <span key={index} className="gooey-loader-blob" style={{ animationDelay: `${-index * 0.3}s` }} />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
