import type { ComponentProps } from "react";
import { Bubble as BaseBubble } from "@/components/ui/bubble";
import { cn } from "@/lib/utils";

export { BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

/**
 * Reactions are absolutely positioned and hang off the bubble's edge, so they take no
 * layout space. Reserve that space here, or they overlap the neighboring bubble.
 */
export function Bubble({ className, ...props }: ComponentProps<typeof BaseBubble>) {
  return (
    <BaseBubble
      className={cn(
        "has-[>[data-slot=bubble-reactions][data-side=bottom]]:mb-4 has-[>[data-slot=bubble-reactions][data-side=top]]:mt-4",
        className
      )}
      {...props}
    />
  );
}
