import type { ComponentType, ReactNode } from "react";

interface ThoughtLineProps {
  label?: string;
  doneLabel?: string;
  glyph?: ReactNode;
  glyphStatic?: boolean;
  color?: string;
  showTimer?: boolean;
  fontSize?: number;
  working?: boolean;
  elapsed?: number;
  collapsible?: boolean;
}

declare const ThoughtLine: ComponentType<ThoughtLineProps>;
export default ThoughtLine;
