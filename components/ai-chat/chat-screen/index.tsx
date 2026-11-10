"use client";

import { SparklesIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useRef } from "react";
import { ChatComposer, type ChatComposerProps } from "@/components/ai-chat/chat-composer";
import { Conversation, type ConversationProps } from "@/components/ai-chat/conversation";
import { cn } from "@/lib/utils";

export type ChatScreenProps = Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode;
  /** Shown on the right of the header, such as a new-chat button. */
  actions?: ReactNode;
  turns: ConversationProps["turns"];
  busy?: boolean;
  onSend: ChatComposerProps["onSend"];
  onStop?: ChatComposerProps["onStop"];
  onCopy?: ConversationProps["onCopy"];
  onRegenerate?: ConversationProps["onRegenerate"];
  onFeedback?: ConversationProps["onFeedback"];
  /** Heading and sub-line of the empty state. */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Starter questions shown while there are no turns. Clicking one sends it. */
  suggestions?: string[];
  composer?: Pick<ChatComposerProps, "placeholder" | "hint" | "tools" | "onAttach">;
};

/** A whole AI chat: header, scrolling conversation or empty state with starter questions, and the composer pinned below. Fills its parent's height. */
export function ChatScreen({
  title,
  actions,
  turns,
  busy,
  onSend,
  onStop,
  onCopy,
  onRegenerate,
  onFeedback,
  emptyTitle = "How can I help?",
  emptyDescription,
  suggestions = [],
  composer,
  className,
  ...props
}: ChatScreenProps) {
  const end = useRef<HTMLDivElement>(null);
  const count = turns.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when a turn is added or the busy state flips
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [count, busy]);

  return (
    <section className={cn("flex h-full min-h-0 flex-col bg-background", className)} {...props}>
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <h2 className="truncate font-medium text-sm">{title}</h2>
        {actions}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6">
          {count === 0 ? (
            <div className="my-auto flex flex-col items-center gap-6 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
                <SparklesIcon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-xl tracking-tight">{emptyTitle}</h3>
                {emptyDescription && (
                  <p className="text-muted-foreground text-sm">{emptyDescription}</p>
                )}
              </div>
              {suggestions.length > 0 && (
                <ul className="flex w-full max-w-md flex-col gap-2">
                  {suggestions.map((text) => (
                    <li key={text}>
                      <button
                        className="w-full rounded-2xl border bg-card px-4 py-3 text-left text-sm shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        onClick={() => onSend(text)}
                        type="button"
                      >
                        {text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Conversation
              busy={busy}
              onCopy={onCopy}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
              turns={turns}
            />
          )}
          <div ref={end} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4">
        <ChatComposer busy={busy} onSend={onSend} onStop={onStop} {...composer} />
      </div>
    </section>
  );
}
