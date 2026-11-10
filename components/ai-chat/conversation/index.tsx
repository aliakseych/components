"use client";

import {
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  RefreshCwIcon,
  SparklesIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConversationTurn = {
  id: string;
  role: "user" | "assistant";
  /** Text, or any rich content such as a code block or a table. */
  content: ReactNode;
  /** A time or status shown under the turn. */
  footer?: ReactNode;
  /** Shows a failed reply with a retry button. */
  error?: boolean;
  /** Tool calls, reasoning or sources shown above the reply text. */
  activity?: ReactNode;
};

export type ConversationProps = Omit<ComponentProps<"div">, "children"> & {
  turns: ConversationTurn[];
  /** Name used for the assistant's accessible label. */
  assistantName?: string;
  /** Shows copy under assistant turns. Receives the turn. */
  onCopy?: (turn: ConversationTurn) => void;
  onRegenerate?: (turn: ConversationTurn) => void;
  /** Shows thumbs up and down under assistant turns. */
  onFeedback?: (turn: ConversationTurn, value: "up" | "down") => void;
  /** Shows a typing indicator after the last turn. */
  busy?: boolean;
  busyLabel?: string;
};

const AssistantMark = ({ busy }: { busy?: boolean }) => (
  <span
    aria-hidden
    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-foreground shadow-xs"
  >
    <SparklesIcon className={cn("size-3", busy && "animate-pulse")} />
  </span>
);

const ActionButton = ({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) => (
  <Button
    aria-label={label}
    aria-pressed={active}
    className={cn("text-muted-foreground", active && "text-foreground")}
    onClick={onClick}
    size="icon-xs"
    title={label}
    type="button"
    variant="ghost"
  >
    {children}
  </Button>
);

const Turn = ({
  turn,
  onCopy,
  onRegenerate,
  onFeedback,
}: { turn: ConversationTurn } & Pick<ConversationProps, "onCopy" | "onRegenerate" | "onFeedback">) => {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  if (turn.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1" data-role="user">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground text-sm leading-relaxed shadow-xs">
          {turn.content}
        </div>
        {turn.footer && (
          <span className="px-1 text-muted-foreground text-xs tabular-nums">{turn.footer}</span>
        )}
      </div>
    );
  }

  const hasActions = !turn.error && (onCopy || onRegenerate || onFeedback);

  return (
    <div className="group/turn flex gap-3" data-role="assistant">
      <AssistantMark />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {turn.activity}
        {turn.error ? (
          <div
            className="flex w-full items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive text-sm"
            role="alert"
          >
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">{turn.content}</div>
          </div>
        ) : (
          <div className="min-w-0 break-words text-foreground text-sm leading-relaxed [&_p+p]:mt-3">
            {turn.content}
          </div>
        )}
        {(turn.footer || hasActions || (turn.error && onRegenerate)) && (
          <div className="-ml-1.5 flex min-h-6 items-center gap-0.5 text-muted-foreground text-xs tabular-nums">
            {turn.footer && <span className="mr-1.5 ml-1.5">{turn.footer}</span>}
            {hasActions && onCopy && (
              <ActionButton
                label={copied ? "Copied" : "Copy reply"}
                onClick={() => {
                  onCopy(turn);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </ActionButton>
            )}
            {hasActions && onFeedback && (
              <>
                <ActionButton
                  active={vote === "up"}
                  label="Good response"
                  onClick={() => {
                    setVote("up");
                    onFeedback(turn, "up");
                  }}
                >
                  <ThumbsUpIcon />
                </ActionButton>
                <ActionButton
                  active={vote === "down"}
                  label="Bad response"
                  onClick={() => {
                    setVote("down");
                    onFeedback(turn, "down");
                  }}
                >
                  <ThumbsDownIcon />
                </ActionButton>
              </>
            )}
            {hasActions && onRegenerate && (
              <ActionButton label="Regenerate reply" onClick={() => onRegenerate(turn)}>
                <RefreshCwIcon />
              </ActionButton>
            )}
            {turn.error && onRegenerate && (
              <Button
                className="ml-1.5"
                onClick={() => onRegenerate(turn)}
                size="xs"
                type="button"
                variant="outline"
              >
                <RefreshCwIcon />
                Try again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** The turns of an AI chat: the person's messages as right-aligned bubbles, the assistant's replies as open text. */
export const Conversation = ({
  turns,
  assistantName = "Assistant",
  onCopy,
  onRegenerate,
  onFeedback,
  busy = false,
  busyLabel = "Thinking",
  className,
  ...props
}: ConversationProps) => (
  <div
    aria-label={`Conversation with ${assistantName}`}
    aria-live="polite"
    className={cn("flex w-full flex-col gap-6", className)}
    role="log"
    {...props}
  >
    {turns.map((turn) => (
      <Turn
        key={turn.id}
        onCopy={onCopy}
        onFeedback={onFeedback}
        onRegenerate={onRegenerate}
        turn={turn}
      />
    ))}
    {busy && (
      <div className="flex items-center gap-3" role="status">
        <AssistantMark busy />
        <span className="flex items-center gap-2 text-muted-foreground text-sm">
          {busyLabel}
          <span aria-hidden className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                className="size-1 rounded-full bg-muted-foreground motion-safe:animate-bounce"
                key={i}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        </span>
      </div>
    )}
  </div>
);
