import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type LiveOrbVariant = "light" | "dark" | "tone";
export type LiveOrbState = "idle" | "listening" | "thinking";

export type LiveOrbColors = {
  /** Top of the sphere. Default depends on `variant`: background, faded foreground, or the tone. */
  body?: string;
  /** Bottom of the sphere. Default: muted for light, foreground for dark, the tone for tone. */
  shade?: string;
  /** Capsule eyes. Default: foreground for light, background otherwise. */
  eye?: string;
  /** Listening pulse ring. Default: foreground, or the tone for tone. */
  glow?: string;
};

export type LiveOrbProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** Light and dark use theme tokens. Tone takes a CSS colour from `tone`. */
  variant?: LiveOrbVariant;
  /** Any CSS colour, such as `var(--chart-4)`. Used when `variant` is "tone". */
  tone?: string;
  /** idle breathes, listening pulses, thinking blinks. */
  state?: LiveOrbState;
  /** Width and height in pixels. */
  size?: number;
  /** Overrides the accessible name, which otherwise describes the state. */
  label?: string;
  /** Colour roles. Each becomes a `--live-orb-*` variable on the root. */
  colors?: LiveOrbColors;
};

const stateText: Record<LiveOrbState, string> = {
  idle: "idle",
  listening: "listening",
  thinking: "thinking",
};

const orbStyles = `
@keyframes live-orb-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.035); }
}
@keyframes live-orb-ring {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.3); }
}
@keyframes live-orb-blink {
  0%, 90%, 100% { transform: scaleY(1); }
  94% { transform: scaleY(0.08); }
}
.live-orb-breathe {
  animation: live-orb-breathe 4s ease-in-out infinite;
}
.live-orb-ring {
  opacity: 0.3;
  transform: scale(1.12);
  animation: live-orb-ring 1.8s ease-out infinite;
}
.live-orb-ring-delay {
  animation-delay: 0.9s;
}
.live-orb-blink {
  animation: live-orb-blink 3.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .live-orb-breathe,
  .live-orb-ring,
  .live-orb-blink {
    animation: none;
  }
  .live-orb-ring-delay {
    display: none;
  }
}
`;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * A sphere with two capsule eyes that follow the pointer. `state` sets
 * the motion: idle breathes, listening pulses a ring, thinking blinks.
 * Pure CSS and a little React state, no canvas or WebGL.
 */
export function LiveOrb({
  variant = "light",
  tone,
  state = "idle",
  size = 160,
  label,
  colors,
  className,
  style,
  ...props
}: LiveOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      // The eyes reach their full offset at 1.5 orb widths from the centre.
      const reach = rect.width * 1.5;
      const maxOffset = rect.width * 0.07;
      setOffset({
        x: clamp(dx / reach, -1, 1) * maxOffset,
        y: clamp(dy / reach, -1, 1) * maxOffset,
      });
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  const defaults =
    variant === "tone"
      ? {
          body: tone ?? "currentColor",
          shade: tone ?? "currentColor",
          eye: "var(--background)",
          glow: tone ?? "currentColor",
        }
      : variant === "dark"
        ? {
            body: "color-mix(in oklab, var(--foreground) 85%, transparent)",
            shade: "var(--foreground)",
            eye: "var(--background)",
            glow: "var(--foreground)",
          }
        : {
            body: "var(--background)",
            shade: "var(--muted)",
            eye: "var(--foreground)",
            glow: "var(--foreground)",
          };

  const colorVars = {
    "--live-orb-body": colors?.body ?? defaults.body,
    "--live-orb-shade": colors?.shade ?? defaults.shade,
    "--live-orb-eye": colors?.eye ?? defaults.eye,
    "--live-orb-glow": colors?.glow ?? defaults.glow,
  } as CSSProperties;

  const bodyClass = cn(
    "absolute inset-0 rounded-full shadow-lg bg-linear-to-b from-[var(--live-orb-body)] to-[var(--live-orb-shade)]",
    variant === "light" && "ring-1 ring-border",
    state === "idle" && "live-orb-breathe",
  );

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? `Assistant orb, ${stateText[state]}`}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size, ...colorVars, ...style }}
      {...props}
    >
      <style>{orbStyles}</style>
      {state === "listening" ? (
        <>
          <span
            aria-hidden="true"
            className="live-orb-ring absolute inset-0 rounded-full border-2 border-[var(--live-orb-glow)]"
          />
          <span
            aria-hidden="true"
            className="live-orb-ring live-orb-ring-delay absolute inset-0 rounded-full border-2 border-[var(--live-orb-glow)]"
          />
        </>
      ) : null}
      <div aria-hidden="true" className={bodyClass}>
        <span className="absolute left-[16%] top-[14%] size-[30%] rounded-full bg-white/25 blur-md" />
        <div
          className="absolute inset-0 transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          <span
            className={cn(
              "absolute left-[31%] top-[38%] h-[24%] w-[11%] rounded-full bg-[var(--live-orb-eye)]",
              state === "thinking" && "live-orb-blink",
            )}
          />
          <span
            className={cn(
              "absolute left-[58%] top-[38%] h-[24%] w-[11%] rounded-full bg-[var(--live-orb-eye)]",
              state === "thinking" && "live-orb-blink",
            )}
          />
        </div>
      </div>
    </div>
  );
}
