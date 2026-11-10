"use client";

import { ArrowUpIcon, PaperclipIcon, SquareIcon } from "lucide-react";
import { type ComponentProps, type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatComposerProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** Called with the trimmed text when the person sends. The field clears afterwards. */
  onSend: (text: string) => void;
  /** Shows a stop button instead of send while the assistant is replying. */
  busy?: boolean;
  onStop?: () => void;
  /** Shows an attach button when set. */
  onAttach?: () => void;
  placeholder?: string;
  /** Extra controls on the left of the toolbar, such as a model picker. */
  tools?: ReactNode;
  /** Small print under the card. */
  hint?: ReactNode;
  disabled?: boolean;
};

/** An AI chat input: a growing text field, an attach button, extra tools and a send/stop button. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
  onSend,
  busy = false,
  onStop,
  onAttach,
  placeholder = "Ask anything",
  tools,
  hint,
  disabled,
  className,
  ...props
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled && !busy;

  const send = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (ref.current) ref.current.style.height = "";
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-2", className)}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        send();
      }}
      {...props}
    >
      <div className="flex flex-col gap-1 rounded-3xl border bg-card p-2 shadow-sm transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <textarea
          aria-label={placeholder}
          className="max-h-40 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = `${event.target.scrollHeight}px`;
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          ref={ref}
          rows={1}
          value={value}
        />
        <div className="flex items-center gap-1">
          {onAttach && (
            <Button
              aria-label="Attach a file"
              className="rounded-full text-muted-foreground"
              onClick={onAttach}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <PaperclipIcon />
            </Button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-1">{tools}</div>
          {busy ? (
            <Button
              aria-label="Stop replying"
              className="rounded-full"
              onClick={onStop}
              size="icon-sm"
              type="button"
            >
              <SquareIcon className="fill-current" />
            </Button>
          ) : (
            <Button
              aria-label="Send message"
              className="rounded-full"
              disabled={!canSend}
              size="icon-sm"
              type="submit"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="text-center text-muted-foreground text-xs">{hint}</p>}
    </form>
  );
}
