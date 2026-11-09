"use client";

import { Sparkles } from "lucide-react";
import { askAi, type AskAiDetail } from "@/lib/ask-ai";
import { cn } from "@/lib/utils";

// Маленькая сиреневая таблетка «Спросить ИИ» для любого блока.
export function AskAiButton({
  label = "Спросить ИИ",
  className,
  ...detail
}: AskAiDetail & { label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => askAi(detail)}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground active:scale-95",
        className,
      )}
    >
      <Sparkles className="size-4" />
      {label}
    </button>
  );
}
