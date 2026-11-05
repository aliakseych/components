import type { ComponentProps } from "react";
import * as UI from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export * from "@/components/ui/drawer";

export function DrawerContent({ className, ...props }: ComponentProps<typeof UI.DrawerContent>) {
  return (
    <UI.DrawerContent
      className={cn(
        "bg-card shadow-lg outline-none",
        "data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=top]:rounded-b-xl",
        // The grab handle is the first child rendered by the shadcn part.
        "[&>div:first-child]:mt-3 [&>div:first-child]:h-1 [&>div:first-child]:w-10 [&>div:first-child]:bg-border",
        className,
      )}
      {...props}
    />
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<typeof UI.DrawerHeader>) {
  return (
    <UI.DrawerHeader
      className={cn(
        "gap-0.5 p-5 text-left md:gap-0.5",
        "group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left group-data-[vaul-drawer-direction=top]/drawer-content:text-left",
        className,
      )}
      {...props}
    />
  );
}

export function DrawerFooter({ className, ...props }: ComponentProps<typeof UI.DrawerFooter>) {
  return <UI.DrawerFooter className={cn("border-t p-5", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof UI.DrawerTitle>) {
  return <UI.DrawerTitle className={cn("tracking-tight", className)} {...props} />;
}
