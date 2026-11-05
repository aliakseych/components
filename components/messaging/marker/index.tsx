import type { ComponentProps } from "react";
import * as UI from "@/components/ui/marker";
import { cn } from "@/lib/utils";

export * from "@/components/ui/marker";

export function Marker({ className, ...props }: ComponentProps<typeof UI.Marker>) {
  return <UI.Marker className={cn("text-xs tabular-nums", className)} {...props} />;
}

export function MarkerIcon({ className, ...props }: ComponentProps<typeof UI.MarkerIcon>) {
  return (
    <UI.MarkerIcon
      className={cn("flex size-6 items-center justify-center rounded-full border bg-card [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  );
}
