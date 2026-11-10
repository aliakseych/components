import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PillNavbarLink = {
  label: string;
  href: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
};

export type PillNavbarColumn = { heading?: string; links: PillNavbarLink[] };

export type PillNavbarItem =
  | { label: string; href: string }
  | { label: string; columns: PillNavbarColumn[]; align?: "start" | "center" };

export type PillNavbarAction = { label: string; href: string; primary?: boolean };

export type PillNavbarBrand = {
  name: string;
  href: string;
  /** SVG path data on a 24×24 grid; each path is stroke-drawn, then filled. */
  paths: string[];
};

export type PillNavbarProps = {
  brand: PillNavbarBrand;
  items: PillNavbarItem[];
  actions?: PillNavbarAction[];
  /** Width in px at and below which the bar collapses behind a Menu button. */
  compactAt?: number;
  /** Label of a menu to show open on mount (for previews). */
  defaultOpen?: string;
  /** Expand the compact panel on mount (for previews). */
  defaultExpanded?: boolean;
  /** Fix the bar to the viewport top. Off by default so it can sit in any layout. */
  fixed?: boolean;
  className?: string;
};

const EASE = "ease-[cubic-bezier(.51,.03,.48,.96)]";
const HOVER = typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

// Visibility flips at once on open (so focus can land) and after the fade on close.
const FADE_IN = "visible opacity-100 [transition:opacity_170ms_cubic-bezier(.51,.03,.48,.96)]";
const FADE_OUT = "invisible opacity-0 [transition:opacity_170ms_cubic-bezier(.51,.03,.48,.96),visibility_0s_170ms]";

function useNarrow(px: number) {
  const query = `(max-width: ${px}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return narrow;
}

const drawCss = `
@keyframes pill-navbar-draw{0%{stroke-dashoffset:1;fill-opacity:0}62%{stroke-dashoffset:0;fill-opacity:0}100%{stroke-dashoffset:0;fill-opacity:1;stroke-opacity:0}}
@keyframes pill-navbar-fade{from{opacity:0}to{opacity:1}}
.pill-navbar-path{stroke-dasharray:1;animation:pill-navbar-draw 1.3s cubic-bezier(.45,0,.25,1) both}
.pill-navbar-word{animation:pill-navbar-fade .5s ease .9s both}
@media (prefers-reduced-motion: reduce){.pill-navbar-path,.pill-navbar-word{animation:none}}
`;

export function PillNavbar({
  brand,
  items,
  actions = [],
  compactAt = 900,
  defaultOpen,
  defaultExpanded = false,
  fixed = false,
  className,
}: PillNavbarProps) {
  const compact = useNarrow(compactAt);
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [min, setMin] = useState(false);
  const pill = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<{ open?: number; close?: number }>({});
  const id = useId();

  const clear = () => {
    window.clearTimeout(timers.current.open);
    window.clearTimeout(timers.current.close);
  };
  const closeAll = () => {
    clear();
    setOpen(null);
    setExpanded(false);
  };

  // Collapse state resets when crossing the breakpoint.
  const prevCompact = useRef(compact);
  useEffect(() => {
    if (prevCompact.current === compact) return;
    prevCompact.current = compact;
    closeAll();
  }, [compact]);

  useEffect(() => {
    const onScroll = () => setMin(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !expanded) return;
    const onClick = (e: MouseEvent) => {
      if (!pill.current?.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const back = compact ? menuBtn.current : pill.current?.querySelector<HTMLButtonElement>(`[data-menu="${open}"]`);
      closeAll();
      back?.focus();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, expanded, compact]);

  useEffect(() => clear, []);

  // Selector to focus once the opened panel has rendered without `inert`.
  const pendingFocus = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pill.current?.querySelector<HTMLElement>(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });
  const focusFirst = (label: string) => {
    pendingFocus.current = `[data-panel="${label}"] a`;
  };

  const enter = (label: string) => {
    if (compact || !HOVER) return;
    clear();
    if (open === label) return;
    timers.current.open = window.setTimeout(() => setOpen(label), open ? 60 : 140);
  };
  const leave = (label: string) => {
    if (compact || !HOVER) return;
    window.clearTimeout(timers.current.open);
    if (open === label) timers.current.close = window.setTimeout(() => setOpen((c) => (c === label ? null : c)), 220);
  };

  const panelKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const step = e.key === "ArrowDown" ? 1 : -1;
    links[at < 0 ? 0 : (at + step + links.length) % links.length]?.focus();
  };

  const navItem =
    "relative z-0 flex h-full items-center px-3.5 text-sm font-medium text-foreground outline-none before:absolute before:inset-x-[5px] before:top-1/2 before:-z-10 before:h-8 before:-translate-y-1/2 before:rounded-full before:transition-colors before:duration-200 hover:before:bg-accent focus-visible:before:ring-2 focus-visible:before:ring-ring";
  const compactRow = "h-11 w-full justify-between rounded-xl px-3 before:hidden hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring";

  const navInert = compact && !expanded;

  return (
    <header className={cn(fixed ? "fixed inset-x-0 top-3 z-50" : "relative", "flex justify-center px-3", className)}>
      <style>{drawCss}</style>
      <div
        ref={pill}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !pill.current?.contains(next)) closeAll();
        }}
        className={cn(
          "relative flex h-14 w-full max-w-6xl items-center gap-2 rounded-[30px] border bg-background pl-6 pr-2 text-foreground transition-shadow duration-400 motion-reduce:transition-none",
          EASE,
          min ? "shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]" : "shadow-sm",
        )}
      >
        <a
          href={brand.href}
          aria-label={brand.name}
          className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden>
            {brand.paths.map((d, i) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                className="pill-navbar-path"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinejoin="round"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              />
            ))}
          </svg>
          <span
            className={cn(
              "pill-navbar-word overflow-hidden whitespace-nowrap text-base font-semibold tracking-tight transition-[max-width,opacity] duration-300",
              EASE,
              compact ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
            )}
          >
            {brand.name}
          </span>
        </a>

        {compact && (
          <button
            ref={menuBtn}
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-nav`}
            onClick={(e) => {
              e.stopPropagation();
              if (expanded) return closeAll();
              setExpanded(true);
              if (e.detail === 0) pendingFocus.current = `[data-nav] a, [data-nav] button`;
            }}
            className={cn(navItem, "ml-1 gap-1.5 h-10")}
          >
            {expanded ? <X className="size-4" /> : <Menu className="size-4" />}
            {expanded ? "Close" : "Menu"}
          </button>
        )}

        <ul
          id={`${id}-nav`}
          data-nav
          inert={navInert}
          className={cn(
            compact
              ? cn(
                  "absolute inset-x-0 top-[calc(100%+6px)] z-10 flex max-h-[70vh] flex-col overflow-y-auto rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl motion-reduce:transition-none",
                  expanded ? FADE_IN : FADE_OUT,
                )
              : "flex h-full items-center",
          )}
        >
          {items.map((item) => {
            if ("href" in item)
              return (
                <li key={item.label} className={compact ? "" : "h-full"}>
                  <a
                    href={item.href}
                    onClick={closeAll}
                    onMouseEnter={() => {
                      if (compact || !open) return;
                      clear();
                      timers.current.close = window.setTimeout(() => setOpen(null), 120);
                    }}
                    className={cn(navItem, compact && compactRow)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            const isOpen = open === item.label;
            const panelId = `${id}-${item.label}`;
            return (
              <li
                key={item.label}
                className={cn("relative", compact ? "" : "h-full")}
                onMouseEnter={() => enter(item.label)}
                onMouseLeave={() => leave(item.label)}
              >
                <button
                  type="button"
                  data-menu={item.label}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={(e) => {
                    clear();
                    // A hover already opened it: a mouse click should not toggle it shut.
                    const hoverOpened = HOVER && e.detail > 0 && !compact;
                    if (isOpen && !hoverOpened) setOpen(null);
                    else {
                      setOpen(item.label);
                      if (e.detail === 0 && !compact) focusFirst(item.label);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowDown") return;
                    e.preventDefault();
                    setOpen(item.label);
                    focusFirst(item.label);
                  }}
                  className={cn(navItem, "gap-1", isOpen && "before:bg-accent", compact && compactRow)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn("size-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-180")}
                  />
                </button>
                <div
                  id={panelId}
                  role="group"
                  aria-label={item.label}
                  data-panel={item.label}
                  inert={!isOpen}
                  onKeyDown={panelKeys}
                  className={cn(
                    compact
                      ? cn("flex-col gap-1 px-1 pb-2", isOpen ? "flex" : "hidden")
                      : cn(
                          "absolute top-[calc(100%+6px)] z-10 flex gap-1 rounded-[14px] border bg-popover px-2.5 pb-3 pt-3.5 text-popover-foreground shadow-[0_24px_64px_-8px_rgb(0_0_0/0.18),0_4px_12px_rgb(0_0_0/0.06)] motion-reduce:transition-none",
                          "before:absolute before:inset-x-0 before:-top-3 before:h-3",
                          item.align === "center" ? "left-1/2 -translate-x-1/2" : "-left-2",
                          isOpen ? FADE_IN : cn("pointer-events-none", FADE_OUT),
                        ),
                  )}
                >
                  {item.columns.map((col, ci) => (
                    <div key={col.heading ?? ci} className={compact ? "w-full" : "w-[280px]"}>
                      {col.heading && (
                        <p className="px-2.5 pb-1.5 pt-1 font-mono text-xs text-muted-foreground">{col.heading}</p>
                      )}
                      {col.links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={link.href + link.label}
                            href={link.href}
                            onClick={closeAll}
                            className="flex items-center gap-3 rounded-[9px] px-2.5 py-2 outline-none transition-colors duration-150 hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                          >
                            {Icon && (
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted text-foreground">
                                <Icon className="size-4" />
                              </span>
                            )}
                            <span className="flex min-w-0 flex-col leading-tight">
                              <b className="text-sm font-medium">{link.label}</b>
                              {link.description && <small className="text-xs text-muted-foreground">{link.description}</small>}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        {actions.length > 0 && (
          <ul className="ml-auto flex h-full shrink-0 items-center">
            {actions.map((a) => (
              <li key={a.label} className={cn("h-full", compact && !a.primary && "hidden")}>
                <a
                  href={a.href}
                  className={cn(
                    navItem,
                    "px-[18px] font-semibold before:h-[38px]",
                    a.primary && "text-primary-foreground before:bg-primary hover:before:bg-primary/90",
                  )}
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
