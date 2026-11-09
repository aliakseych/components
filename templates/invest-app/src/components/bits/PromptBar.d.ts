import type { ComponentType } from "react";

interface PromptBarProps {
  placeholder?: string;
  labels?: { prompt?: string; send?: string; stop?: string; effort?: string; faster?: string; smarter?: string };
  onSend?: (text: string) => void;
  background?: string;
  color?: string;
  sparkColor?: string;
}

declare const PromptBar: ComponentType<PromptBarProps>;
export default PromptBar;
