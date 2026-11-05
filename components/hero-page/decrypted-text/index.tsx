import type { ComponentProps, ComponentType } from "react";
import DecryptedTextRaw from "./DecryptedText.jsx";

export type DecryptedTextProps = Omit<ComponentProps<"span">, "children"> & {
  text: string;
  speed?: number;
  maxIterations?: number;
  /** Reveal one character at a time rather than all together. */
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "view" | "hover" | "inViewHover" | "click";
  clickMode?: "once" | "toggle";
  effect?: string;
  scrambleColor?: string;
  loop?: boolean;
  loopDelay?: number;
  hoverRadius?: number;
};

export const DecryptedText = DecryptedTextRaw as unknown as ComponentType<DecryptedTextProps>;
