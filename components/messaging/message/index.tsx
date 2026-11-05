import type { ComponentProps } from "react";
import * as UI from "@/components/ui/message";
import { cn } from "@/lib/utils";

export * from "@/components/ui/message";

export function MessageGroup({ className, ...props }: ComponentProps<typeof UI.MessageGroup>) {
  return <UI.MessageGroup className={cn("gap-4", className)} {...props} />;
}

export function Message({ className, ...props }: ComponentProps<typeof UI.Message>) {
  return <UI.Message className={cn("gap-3", className)} {...props} />;
}

export function MessageAvatar({ className, ...props }: ComponentProps<typeof UI.MessageAvatar>) {
  return (
    <UI.MessageAvatar
      className={cn("self-start group-has-data-[slot=message-footer]/message:translate-y-0", className)}
      {...props}
    />
  );
}

export function MessageContent({ className, ...props }: ComponentProps<typeof UI.MessageContent>) {
  return <UI.MessageContent className={cn("gap-1.5", className)} {...props} />;
}

export function MessageHeader({ className, ...props }: ComponentProps<typeof UI.MessageHeader>) {
  return <UI.MessageHeader className={cn("gap-2 px-0 font-normal tabular-nums", className)} {...props} />;
}

export function MessageFooter({ className, ...props }: ComponentProps<typeof UI.MessageFooter>) {
  return <UI.MessageFooter className={cn("gap-1 px-0 font-normal tabular-nums", className)} {...props} />;
}
