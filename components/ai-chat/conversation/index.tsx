"use client";

import {
  CircleAlertIcon,
  CopyIcon,
  RefreshCwIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/messaging/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/messaging/message";
import { cn } from "@/lib/utils";

export type ConversationTurn = {
  id: string;
  role: "user" | "assistant";
  /** Text, or any rich content such as a code block. */
  content: ReactNode;
  /** A time or status shown under the turn. */
  footer?: ReactNode;
  /** Shows a failed reply with a retry button. */
  error?: boolean;
};

export type ConversationProps = Omit<ComponentProps<"div">, "children"> & {
  turns: ConversationTurn[];
  user?: { name: string; image?: string };
  assistant?: { name: string; image?: string };
  /** Shows copy and regenerate under assistant turns. */
  onCopy?: (turn: ConversationTurn) => void;
  onRegenerate?: (turn: ConversationTurn) => void;
  /** Shows "Thinking…" after the last turn. */
  busy?: boolean;
  busyLabel?: string;
};

const avatarClassName =
  "size-7 min-w-7 self-start bg-transparent group-has-data-[slot=message-footer]/message:translate-y-0";

const AssistantAvatar = ({ image, busy }: { image?: string; busy?: boolean }) => (
  <MessageAvatar className={avatarClassName}>
    <Avatar className="size-7">
      <AvatarImage alt="" src={image} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        <SparklesIcon className={cn("size-3.5", busy && "animate-pulse")} />
      </AvatarFallback>
    </Avatar>
  </MessageAvatar>
);

const ActionButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Button
    aria-label={label}
    className="text-muted-foreground"
    onClick={onClick}
    size="icon-xs"
    title={label}
    type="button"
    variant="ghost"
  >
    {children}
  </Button>
);

/** The turns of an AI chat, built from the messaging Message and Bubble parts. */
export const Conversation = ({
  turns,
  user = { name: "You" },
  assistant = { name: "Assistant" },
  onCopy,
  onRegenerate,
  busy = false,
  busyLabel = "Thinking…",
  className,
  ...props
}: ConversationProps) => (
  <MessageGroup aria-live="polite" className={cn("w-full gap-5", className)} {...props}>
    {turns.map((turn) => {
      const fromUser = turn.role === "user";
      const who = fromUser ? user : assistant;
      const showActions = !fromUser && (onCopy || onRegenerate);

      return (
        <Message align={fromUser ? "end" : "start"} className="gap-2.5" key={turn.id}>
          {fromUser ? (
            <MessageAvatar className={avatarClassName}>
              <Avatar className="size-7">
                <AvatarImage alt="" src={who.image} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="size-3.5" />
                </AvatarFallback>
              </Avatar>
            </MessageAvatar>
          ) : (
            <AssistantAvatar image={who.image} />
          )}
          <MessageContent className="gap-1.5">
            <MessageHeader className="min-h-7 px-0">{who.name}</MessageHeader>
            {turn.error ? (
              <div
                className="flex w-full items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive text-sm"
                role="alert"
              >
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">{turn.content}</div>
              </div>
            ) : (
              <Bubble
                align={fromUser ? "end" : "start"}
                variant={fromUser ? "muted" : "ghost"}
              >
                <BubbleContent className="max-w-full">{turn.content}</BubbleContent>
              </Bubble>
            )}
            {(turn.footer || showActions) && (
              <MessageFooter className="min-h-6 gap-0.5 px-0 font-normal tabular-nums">
                {turn.footer && <span className="not-last:mr-1.5">{turn.footer}</span>}
                {!fromUser && onCopy && !turn.error && (
                  <ActionButton label="Copy reply" onClick={() => onCopy(turn)}>
                    <CopyIcon />
                  </ActionButton>
                )}
                {!fromUser &&
                  onRegenerate &&
                  (turn.error ? (
                    <Button
                      onClick={() => onRegenerate(turn)}
                      size="xs"
                      type="button"
                      variant="outline"
                    >
                      <RefreshCwIcon />
                      Try again
                    </Button>
                  ) : (
                    <ActionButton
                      label="Regenerate reply"
                      onClick={() => onRegenerate(turn)}
                    >
                      <RefreshCwIcon />
                    </ActionButton>
                  ))}
              </MessageFooter>
            )}
          </MessageContent>
        </Message>
      );
    })}
    {busy && (
      <Message className="gap-2.5">
        <AssistantAvatar busy image={assistant.image} />
        <MessageContent>
          <p className="flex min-h-7 items-center text-muted-foreground text-sm">{busyLabel}</p>
        </MessageContent>
      </Message>
    )}
  </MessageGroup>
);
