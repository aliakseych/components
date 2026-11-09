import { useState } from "react";
import { Globe, Sparkles, Zap } from "lucide-react";
import { ExpandingPromptBar } from "../index";

const MODELS = [
  { key: "fast", name: "Model name", icon: <Zap className="size-4" aria-hidden /> },
  { key: "pro", name: "Pro model", icon: <Sparkles className="size-4" aria-hidden /> },
  { key: "web", name: "Web search", icon: <Globe className="size-4" aria-hidden /> },
];

/** A pill prompt that opens into a card with suggestions and a model and effort toolbar. */
export default function Demo() {
  const [value, setValue] = useState("");
  return (
    <div
      className="flex min-h-96 w-full items-center justify-center rounded-2xl p-4"
      style={{
        background:
          "radial-gradient(60% 55% at 50% 110%, var(--chart-3), transparent 75%), linear-gradient(to bottom, color-mix(in oklch, var(--chart-2) 35%, var(--background)), color-mix(in oklch, var(--chart-1) 30%, var(--background)))",
      }}
    >
      <ExpandingPromptBar
        value={value}
        onChange={setValue}
        onSubmit={() => setValue("")}
        placeholder="Ask anything…"
        models={MODELS}
        defaultModel="fast"
        efforts={["Low", "Medium", "High"]}
        defaultEffort="Medium"
        suggestions={["Summarize my week", "Draft a reply", "Explain this chart"]}
        onVoice={() => setValue("What changed in the last release?")}
      />
    </div>
  );
}
