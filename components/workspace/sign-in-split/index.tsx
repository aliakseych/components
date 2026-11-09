import { useId, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Auth5Form, type Auth5FormProps } from "@/components/workspace/auth-05";

export type FlowTexture = "waves" | "grain" | "mesh";

export const flowPanelDefaultColors = ["var(--chart-1)", "var(--chart-2)", "var(--primary)"];

export type FlowPanelProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  /** @default "mesh" */
  texture?: FlowTexture;
  /** Seconds for one loop of the main drift. @default 18 */
  speed?: number;
  /** 3 to 4 CSS colours, such as `var(--chart-1)`. Blobs cycle through them. */
  colors?: string[];
  /** Content on top of the panel, such as a quote. */
  children?: ReactNode;
};

type Blob = {
  x: string;
  y: string;
  size: string;
  dx: string;
  dy: string;
  /** Multiplies `speed`, so blobs drift out of step. */
  pace: number;
  delay: number;
};

const blobs: Blob[] = [
  { x: "-14%", y: "-20%", size: "72%", dx: "8%", dy: "6%", pace: 1, delay: 0 },
  { x: "56%", y: "6%", size: "66%", dx: "-7%", dy: "9%", pace: 1.3, delay: 2 },
  { x: "8%", y: "50%", size: "76%", dx: "9%", dy: "-6%", pace: 0.8, delay: 5 },
  { x: "34%", y: "22%", size: "56%", dx: "-6%", dy: "-8%", pace: 1.1, delay: 9 },
];

// Static keyframes, shared by every panel. Motion is switched off for reduced-motion users.
const css = `
@keyframes fp-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(var(--fp-dx), var(--fp-dy), 0) scale(1.12); }
}
@keyframes fp-flow {
  from { transform: rotate(-14deg) translate3d(0, 0, 0); }
  to { transform: rotate(-14deg) translate3d(60px, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [data-flow-panel] .fp-blob,
  [data-flow-panel] .fp-stripes { animation: none !important; }
}
`;

const soft = (color: string, percent: number) =>
  `color-mix(in oklab, ${color} ${percent}%, transparent)`;

export function FlowPanel({
  texture = "mesh",
  speed = 18,
  colors = flowPanelDefaultColors,
  children,
  className,
  ...props
}: FlowPanelProps) {
  const filterId = `${useId().replace(/[^a-zA-Z0-9]/g, "")}-grain`;
  const palette = colors.length > 0 ? colors : flowPanelDefaultColors;
  const layers = texture === "mesh" ? blobs : blobs.slice(0, 3);

  return (
    <div
      data-flow-panel
      data-texture={texture}
      className={cn("relative isolate overflow-hidden bg-muted", className)}
      {...props}
    >
      <style>{css}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {layers.map((blob, index) => {
          const style = {
            left: blob.x,
            top: blob.y,
            width: blob.size,
            aspectRatio: "1",
            background: `radial-gradient(closest-side, ${soft(palette[index % palette.length], 70)}, transparent)`,
            animation: `fp-drift ${speed * blob.pace}s ease-in-out ${-blob.delay}s infinite`,
            "--fp-dx": blob.dx,
            "--fp-dy": blob.dy,
          } as CSSProperties;
          return <span key={index} className="fp-blob absolute rounded-full" style={style} />;
        })}

        {texture === "waves" && (
          <span
            className="fp-stripes absolute"
            style={{
              inset: "-50%",
              background: `repeating-linear-gradient(90deg, ${soft(palette[1 % palette.length], 45)} 0 22px, transparent 22px 60px)`,
              animation: `fp-flow ${speed * 0.5}s linear infinite`,
            }}
          />
        )}

        {texture === "grain" && (
          <svg className="absolute inset-0 size-full opacity-40 mix-blend-overlay">
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${filterId})`} />
          </svg>
        )}
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-end">{children}</div>
    </div>
  );
}

export type SignInSplitProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  /** Props for the form in the left column, from workspace/auth-05. `productName` is required. */
  form: Auth5FormProps;
  texture?: FlowTexture;
  /** Seconds per loop of the panel. @default 18 */
  speed?: number;
  /** 3 to 4 CSS colours for the panel. */
  colors?: string[];
  /** Hide the panel below `md`. Otherwise it stacks under the form. @default false */
  hidePanelOnMobile?: boolean;
  /** Quote or testimonial shown in the panel. */
  children?: ReactNode;
};

export function SignInSplit({
  form,
  texture = "mesh",
  speed,
  colors,
  hidePanelOnMobile = false,
  children,
  className,
  ...props
}: SignInSplitProps) {
  return (
    <section
      className={cn(
        "grid w-full overflow-hidden rounded-xl border bg-card shadow-sm md:grid-cols-2",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center justify-center p-4 sm:p-10">
        <Auth5Form {...form} embedded />
      </div>

      <FlowPanel
        texture={texture}
        speed={speed}
        colors={colors}
        className={cn(
          "min-h-64 p-6 sm:p-10 md:min-h-[420px]",
          hidePanelOnMobile && "hidden md:block",
        )}
      >
        {children && (
          <figure className="rounded-xl border bg-card/90 p-5 shadow-lg backdrop-blur">
            {children}
          </figure>
        )}
      </FlowPanel>
    </section>
  );
}
