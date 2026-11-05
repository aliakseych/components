import { useRef } from "react";
import type { ComponentPropsWithoutRef, PointerEvent } from "react";
import { cn } from "@/lib/utils";

export type MagneticButtonProps = ComponentPropsWithoutRef<"button"> & {
  /** How far the button follows the cursor, from 0 to 1. */
  strength?: number;
};

export function MagneticButton({
  strength = 0.3,
  className,
  type = "button",
  onPointerMove,
  onPointerLeave,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    onPointerMove?.(event);
    const button = ref.current;
    if (
      !button ||
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const box = button.getBoundingClientRect();
    const x = (event.clientX - box.left - box.width / 2) * strength;
    const y = (event.clientY - box.top - box.height / 2) * strength;
    button.style.translate = `${x}px ${y}px`;
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    onPointerLeave?.(event);
    if (ref.current) ref.current.style.translate = "";
  }

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "min-h-11 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-[translate,background-color] duration-150 ease-out hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
    />
  );
}
