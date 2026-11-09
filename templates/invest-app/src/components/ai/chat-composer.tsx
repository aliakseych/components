"use client";

import PromptBar from "@/components/bits/PromptBar";

export function ChatComposer({ pending, onSend }: { pending: boolean; onSend: (text: string) => void }) {
  return (
    <fieldset disabled={pending} className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 disabled:opacity-60">
      <PromptBar
        placeholder="Спросите об инвестициях"
        labels={{ prompt: "Сообщение", send: "Отправить", stop: "Подождите", effort: "Режим", faster: "Быстрее", smarter: "Точнее" }}
        onSend={(text: string) => onSend(text)}
        background="var(--card)"
        color="var(--foreground)"
        sparkColor="var(--accent)"
      />
    </fieldset>
  );
}
