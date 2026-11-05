import type { ComponentProps } from "react";
import * as UI from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

export * from "@/components/ui/menubar";

const panel = "rounded-xl bg-popover p-1 shadow-md";
const row = "rounded-md py-1.5";

export function Menubar({ className, ...props }: ComponentProps<typeof UI.Menubar>) {
  return <UI.Menubar className={cn("h-10 rounded-xl bg-card shadow-xs", className)} {...props} />;
}

export function MenubarTrigger({ className, ...props }: ComponentProps<typeof UI.MenubarTrigger>) {
  return (
    <UI.MenubarTrigger
      className={cn(
        "h-8 rounded-md px-2.5 py-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function MenubarContent({ className, ...props }: ComponentProps<typeof UI.MenubarContent>) {
  return <UI.MenubarContent className={cn(panel, "min-w-52", className)} {...props} />;
}

export function MenubarSubContent({ className, ...props }: ComponentProps<typeof UI.MenubarSubContent>) {
  return <UI.MenubarSubContent className={cn(panel, className)} {...props} />;
}

export function MenubarItem({ className, ...props }: ComponentProps<typeof UI.MenubarItem>) {
  return <UI.MenubarItem className={cn(row, className)} {...props} />;
}

export function MenubarCheckboxItem({ className, ...props }: ComponentProps<typeof UI.MenubarCheckboxItem>) {
  return <UI.MenubarCheckboxItem className={cn(row, className)} {...props} />;
}

export function MenubarRadioItem({ className, ...props }: ComponentProps<typeof UI.MenubarRadioItem>) {
  return <UI.MenubarRadioItem className={cn(row, className)} {...props} />;
}

export function MenubarSubTrigger({ className, ...props }: ComponentProps<typeof UI.MenubarSubTrigger>) {
  return <UI.MenubarSubTrigger className={cn(row, className)} {...props} />;
}

export function MenubarLabel({ className, ...props }: ComponentProps<typeof UI.MenubarLabel>) {
  return <UI.MenubarLabel className={cn("text-xs font-normal text-muted-foreground", className)} {...props} />;
}

export function MenubarShortcut({ className, ...props }: ComponentProps<typeof UI.MenubarShortcut>) {
  return <UI.MenubarShortcut className={cn("font-mono tracking-normal tabular-nums", className)} {...props} />;
}
