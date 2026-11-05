import type { ComponentProps } from "react";
import * as UI from "@/components/ui/trace";
import { cn } from "@/lib/utils";

export * from "@/components/ui/trace";

export function Trace({ className, ...props }: ComponentProps<typeof UI.Trace>) {
  return <UI.Trace className={cn("gap-2.5", className)} {...props} />;
}

export function TraceLine({ className, ...props }: ComponentProps<typeof UI.TraceLine>) {
  return <UI.TraceLine className={cn("data-[status=running]:text-foreground", className)} {...props} />;
}

export function TraceTitle({ className, ...props }: ComponentProps<typeof UI.TraceTitle>) {
  return <UI.TraceTitle className={cn("font-medium", className)} {...props} />;
}

export function TraceDescription({ className, ...props }: ComponentProps<typeof UI.TraceDescription>) {
  return <UI.TraceDescription className={cn("text-xs font-normal text-muted-foreground", className)} {...props} />;
}

export function TraceCollapsibleContent({ className, ...props }: ComponentProps<typeof UI.TraceCollapsibleContent>) {
  return <UI.TraceCollapsibleContent className={cn("text-sm", className)} {...props} />;
}
