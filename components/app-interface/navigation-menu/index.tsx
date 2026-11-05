import type { ComponentProps } from "react";
import * as UI from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export * from "@/components/ui/navigation-menu";

const triggerLook =
  "h-8 rounded-md bg-transparent px-2.5 py-0 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground data-[state=open]:hover:bg-muted data-[state=open]:focus:bg-muted";

export function navigationMenuTriggerStyle() {
  return cn(UI.navigationMenuTriggerStyle(), triggerLook);
}

export function NavigationMenuViewport({ className, ...props }: ComponentProps<typeof UI.NavigationMenuViewport>) {
  return <UI.NavigationMenuViewport className={cn("rounded-xl shadow-md", className)} {...props} />;
}

// The shadcn root renders its own viewport with no way to style it, so this one
// turns that off, restores the data attribute its styles key on, and renders ours.
export function NavigationMenu({ viewport = true, children, ...props }: ComponentProps<typeof UI.NavigationMenu>) {
  return (
    <UI.NavigationMenu viewport={false} data-viewport={viewport} {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </UI.NavigationMenu>
  );
}

export function NavigationMenuTrigger({ className, ...props }: ComponentProps<typeof UI.NavigationMenuTrigger>) {
  return <UI.NavigationMenuTrigger className={cn(triggerLook, className)} {...props} />;
}

export function NavigationMenuContent({ className, ...props }: ComponentProps<typeof UI.NavigationMenuContent>) {
  return (
    <UI.NavigationMenuContent
      className={cn("group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:shadow-md", className)}
      {...props}
    />
  );
}

export function NavigationMenuLink({ className, ...props }: ComponentProps<typeof UI.NavigationMenuLink>) {
  return <UI.NavigationMenuLink className={cn("rounded-md hover:bg-muted focus:bg-muted", className)} {...props} />;
}
