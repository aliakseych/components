import type { ComponentProps, ComponentType, CSSProperties } from "react";
import GradientASCIIRaw from "./GradientASCII.jsx";

export type GradientASCIIProps = Omit<ComponentProps<"div">, "children"> & {
  colors?: readonly string[];
  shape?: "horizon" | "pinch" | "rise" | "eclipse" | "flat";
  characters?: string;
  cellSize?: number;
  density?: number;
  glyphOpacity?: number;
  glow?: number;
  depthOfField?: number;
  flicker?: number;
  softness?: number;
  scale?: number;
  flow?: number;
  speed?: number;
  gradientOpacity?: number;
  grain?: number;
  variation?: number;
  mouseInteraction?: boolean;
  scrambleRadius?: number;
  clickEffect?: "none" | "wave" | "burst";
  intro?: boolean;
  lightMode?: boolean;
  fontFamily?: string;
  dpr?: number;
  style?: CSSProperties;
};

/** Both layers together: the horizon glow with noise characters following its shape. */
export const GradientASCII = GradientASCIIRaw as unknown as ComponentType<GradientASCIIProps>;

/** Only the smooth glow, with no characters. Choose its form with `shape`. */
export function HorizonBackground(props: GradientASCIIProps) {
  return (
    <GradientASCII
      glyphOpacity={0}
      glow={0}
      mouseInteraction={false}
      clickEffect="none"
      {...props}
    />
  );
}

/** Only the random characters, spread evenly, on a transparent background. */
export function NoiseBackground(props: GradientASCIIProps) {
  return <GradientASCII shape="flat" gradientOpacity={0} grain={0} {...props} />;
}
