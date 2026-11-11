import { useEffect, useId, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FloatingMenuItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type FloatingMenuColors = {
  /** Pill and panel background. Default: var(--foreground). */
  surface?: string;
  /** Label, icons and link text. Default: var(--background). */
  text?: string;
  /** Hover tint, mixed 10% into transparent. Default: var(--background). */
  muted?: string;
};

export type FloatingMenuProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  items: FloatingMenuItem[];
  /** Text shown in the closed pill, and the menu's accessible name. */
  label?: string;
  defaultOpen?: boolean;
  /** Colour roles. Each becomes a `--floating-menu-*` variable on the root. */
  colors?: FloatingMenuColors;
};

const hoverTint =
  "hover:bg-[color-mix(in_oklab,var(--floating-menu-muted)_10%,transparent)]";
const focusRing =
  "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--floating-menu-text)_60%,transparent)]";

/**
 * A floating pill at the bottom centre of its container. It widens and
 * grows into a panel of links when opened. Escape closes it and returns
 * focus to the toggle. Place it in a `fixed` wrapper to float over a page.
 */
export function FloatingMenu({
  items,
  label = "Menu",
  defaultOpen = false,
  colors,
  className,
  style,
  ...props
}: FloatingMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (!pillRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const colorVars = {
    "--floating-menu-surface": colors?.surface ?? "var(--foreground)",
    "--floating-menu-text": colors?.text ?? "var(--background)",
    "--floating-menu-muted": colors?.muted ?? "var(--background)",
  } as CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-center px-4",
        className,
      )}
      style={{ ...colorVars, ...style }}
      {...props}
    >
      <div
        ref={pillRef}
        className={cn(
          "pointer-events-auto flex flex-col-reverse overflow-hidden rounded-[24px] bg-[var(--floating-menu-surface)] text-[var(--floating-menu-text)] shadow-lg transition-[width,box-shadow] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          open ? "w-72 shadow-2xl" : "w-44",
        )}
      >
        <div className="flex h-12 items-center justify-between gap-3 pl-4 pr-1.5">
          <span className="truncate text-sm font-medium">{label}</span>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? `Close ${label.toLowerCase()}` : `Open ${label.toLowerCase()}`}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full outline-none",
              hoverTint,
              focusRing,
            )}
          >
            <span className="relative block size-4">
              <Menu
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 size-4 transition-all duration-300 ease-out motion-reduce:transition-none",
                  open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
                )}
              />
              <X
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 size-4 transition-all duration-300 ease-out motion-reduce:transition-none",
                  open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
                )}
              />
            </span>
          </button>
        </div>
        <div
          id={panelId}
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 duration-200",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <nav aria-label={label}>
              <ul className="flex flex-col gap-1 p-2 pb-0">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm outline-none",
                          hoverTint,
                          focusRing,
                          "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
                          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                        )}
                        style={{ transitionDelay: open ? `${(items.length - 1 - index) * 40 + 80}ms` : "0ms" }}
                      >
                        {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
                        <span className="truncate">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
