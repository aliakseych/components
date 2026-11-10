import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { ArrowUp, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string }>;

export type PillNavbarLink = {
  label: string;
  href: string;
  description?: string;
  icon?: Icon;
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

/** A page section the bar tracks once the reader scrolls past the hero. */
export type PillNavbarSection = { id: string; title: string };

/** An icon button beside the bar; `label` is its tooltip and accessible name. */
export type PillNavbarTool = { label: string; icon: Icon; href?: string; onClick?: () => void };

export type PillNavbarProps = {
  brand: PillNavbarBrand;
  items: PillNavbarItem[];
  actions?: PillNavbarAction[];
  /** Menu shown while hovering the logo. */
  brandMenu?: { label: string; href: string; icon?: Icon }[];
  /**
   * Three or more sections turn on the "on this page" mode: past 60% of the viewport the
   * nav folds into a chip with the current section, a progress bar and a section menu.
   */
  sections?: PillNavbarSection[];
  /** Icon buttons pinned to the right edge (hidden at 1000px and below). */
  tools?: PillNavbarTool[];
  /** Width in px at and below which the bar collapses behind a Menu button. */
  compactAt?: number;
  /** Label of a menu to show open on mount (for previews). */
  defaultOpen?: string;
  /** Expand the compact panel on mount (for previews). */
  defaultExpanded?: boolean;
  /** Keep the bar folded into the section chip regardless of scroll (for previews; needs `sections`). */
  defaultFolded?: boolean;
  /** Fix the bar to the viewport top. Off by default so it can sit in any layout. */
  fixed?: boolean;
  className?: string;
};

const EASE = "ease-[cubic-bezier(.51,.03,.48,.96)]";
const HOVER = typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
const REDUCE = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Visibility flips at once on open (so focus can land) and after the fade on close.
const FADE_IN = "visible opacity-100 [transition:opacity_170ms_cubic-bezier(.51,.03,.48,.96)]";
const FADE_OUT = "invisible opacity-0 [transition:opacity_170ms_cubic-bezier(.51,.03,.48,.96),visibility_0s_170ms]";

const POPOVER = "absolute top-[calc(100%+8px)] z-10 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[0_8px_24px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.06)]";

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
.pill-navbar-pop{animation:pill-navbar-fade .16s cubic-bezier(.2,.7,.2,1)}
@media (prefers-reduced-motion: reduce){.pill-navbar-path,.pill-navbar-word,.pill-navbar-pop{animation:none}}
`;

export function PillNavbar({
  brand,
  items,
  actions = [],
  brandMenu,
  sections = [],
  tools = [],
  compactAt = 900,
  defaultOpen,
  defaultExpanded = false,
  defaultFolded = false,
  fixed = false,
  className,
}: PillNavbarProps) {
  const compact = useNarrow(compactAt);
  const hasOp = sections.length >= 3;
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [min, setMin] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const [folded, setFolded] = useState(hasOp && defaultFolded);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [opOpen, setOpOpen] = useState(false);
  const [opLeft, setOpLeft] = useState(0);
  const pill = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const chip = useRef<HTMLButtonElement>(null);
  const timers = useRef<{ open?: number; close?: number; logo?: number; op?: number; width?: number }>({});
  const fullWidth = useRef(0);
  const id = useId();

  const clear = () => {
    window.clearTimeout(timers.current.open);
    window.clearTimeout(timers.current.close);
  };
  const closeAll = () => {
    clear();
    setOpen(null);
    setExpanded(false);
    setLogoOpen(false);
    setOpOpen(false);
  };

  // Collapse state resets when crossing the breakpoint.
  const prevCompact = useRef(compact);
  useEffect(() => {
    if (prevCompact.current === compact) return;
    prevCompact.current = compact;
    closeAll();
    if (folded && pill.current) pill.current.style.width = `${foldWidth()}px`;
  }, [compact]);

  const foldWidth = () => {
    const room = window.innerWidth - 24;
    return Math.round(compact ? Math.min(room, 400) : Math.min(room, Math.max(fullWidth.current * 0.62, 460)));
  };

  // Pin the current width before the fold flips so the layout effect can animate from it.
  const fold = (on: boolean) => {
    const el = pill.current;
    if (!el) return setFolded(on);
    window.clearTimeout(timers.current.width);
    if (on) {
      if (!el.style.width) fullWidth.current = el.offsetWidth;
      closeAll();
    } else setOpOpen(false);
    el.style.width = `${el.offsetWidth}px`;
    setFolded(on);
  };

  const prevFolded = useRef(folded);
  useLayoutEffect(() => {
    const el = pill.current;
    if (!el || prevFolded.current === folded) return;
    prevFolded.current = folded;
    void el.offsetWidth;
    if (folded) {
      el.style.width = `${foldWidth()}px`;
      return;
    }
    el.style.width = `${fullWidth.current}px`;
    timers.current.width = window.setTimeout(() => (el.style.width = ""), REDUCE ? 0 : 650);
  }, [folded]);

  useEffect(() => {
    if (folded && pill.current && !pill.current.style.width) {
      // Started folded: measure the full bar once, then pin the folded width.
      fullWidth.current = pill.current.offsetWidth;
      pill.current.style.width = `${foldWidth()}px`;
    }
  }, []);

  // Scroll: shadow, section spy, progress and fold.
  const foldedRef = useRef(folded);
  foldedRef.current = folded;
  useEffect(() => {
    let ticking = false;
    const spy = () => {
      ticking = false;
      setMin(window.scrollY > 120);
      if (!hasOp) return;
      const line = (pill.current?.getBoundingClientRect().bottom ?? 0) + 56;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      let i = 0;
      sections.forEach((s, k) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) i = k;
      });
      if (docH > 0 && window.scrollY >= docH - 4) i = sections.length - 1;
      setCurrent(i);
      setProgress(Math.round(100 * Math.min(1, window.scrollY / Math.max(1, docH))));
      if (defaultFolded) return;
      const f = window.scrollY > window.innerHeight * 0.6;
      if (f !== foldedRef.current) fold(f);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasOp, sections]);

  useEffect(() => {
    if (!open && !expanded && !logoOpen && !opOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!pill.current?.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const back = opOpen
        ? chip.current
        : logoOpen
          ? pill.current?.querySelector<HTMLElement>("[data-brand]")
          : compact
            ? menuBtn.current
            : pill.current?.querySelector<HTMLButtonElement>(`[data-menu="${open}"]`);
      closeAll();
      back?.focus();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, expanded, compact, logoOpen, opOpen]);

  useEffect(
    () => () => {
      clear();
      window.clearTimeout(timers.current.logo);
      window.clearTimeout(timers.current.op);
      window.clearTimeout(timers.current.width);
    },
    [],
  );

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

  const logoHover = (on: boolean) => {
    if (!brandMenu?.length || !HOVER) return;
    window.clearTimeout(timers.current.logo);
    if (on) {
      clear();
      setOpen(null);
      setOpOpen(false);
      setLogoOpen(true);
    } else timers.current.logo = window.setTimeout(() => setLogoOpen(false), 180);
  };

  const showOp = (on: boolean) => {
    if (on) {
      clear();
      setOpen(null);
      setLogoOpen(false);
      const p = pill.current?.getBoundingClientRect();
      const c = chip.current?.getBoundingClientRect();
      if (p && c) setOpLeft(Math.max(0, Math.round(c.left - p.left)));
    }
    setOpOpen(on);
  };
  const opHover = (on: boolean) => {
    if (!HOVER) return;
    window.clearTimeout(timers.current.op);
    if (on && !opOpen && folded) timers.current.op = window.setTimeout(() => showOp(true), 140);
    if (!on && opOpen) timers.current.op = window.setTimeout(() => showOp(false), 220);
  };

  const goTo = (section: PillNavbarSection | null) => {
    showOp(false);
    const el = section && document.getElementById(section.id);
    const bar = (pill.current?.getBoundingClientRect().bottom ?? 0) + 16;
    const y = el ? el.getBoundingClientRect().top + window.scrollY - bar : 0;
    window.scrollTo({ top: Math.max(0, y), behavior: REDUCE ? "auto" : "smooth" });
    // Leave hash-routed apps (`#/…`) alone.
    if (!location.hash.startsWith("#/")) history.replaceState(null, "", el ? `#${el.id}` : location.pathname + location.search);
  };

  const listKeys = (e: KeyboardEvent<HTMLElement>) => {
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

  const navInert = compact ? !expanded : folded;
  const small = compact || folded;

  return (
    <header className={cn(fixed ? "fixed inset-x-0 top-4 z-50" : "relative", "flex justify-center px-3", className)}>
      <style>{drawCss}</style>
      <div
        ref={pill}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !pill.current?.contains(next)) closeAll();
        }}
        className={cn(
          "relative flex h-14 max-w-full items-center rounded-[30px] border bg-background pl-6 pr-2 text-foreground motion-reduce:transition-none max-[600px]:pl-[18px]",
          "[transition:box-shadow_.4s,width_.45s_cubic-bezier(.51,.03,.48,.96)]",
          min ? "shadow-[0_16px_40px_rgb(0_0_0/0.16)]" : "shadow-[0_2px_6px_rgb(0_0_0/0.05)]",
        )}
      >
        <div className="relative h-full shrink-0" onMouseEnter={() => logoHover(true)} onMouseLeave={() => logoHover(false)}>
          <a
            href={brand.href}
            data-brand
            aria-label={brand.name}
            aria-haspopup={brandMenu?.length ? "menu" : undefined}
            aria-expanded={brandMenu?.length ? logoOpen : undefined}
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" || !brandMenu?.length) return;
              e.preventDefault();
              setOpen(null);
              setOpOpen(false);
              setLogoOpen(true);
              pendingFocus.current = "[data-brand-menu] a";
            }}
            className={cn(
              "flex h-full items-center rounded-md outline-none transition-[margin,gap] duration-300 focus-visible:ring-2 focus-visible:ring-ring",
              EASE,
              small ? "mr-3 gap-0" : "mr-3.5 gap-2",
            )}
          >
            <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-primary" aria-hidden>
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
                small ? "max-w-0 opacity-0" : "max-w-40 opacity-100",
              )}
            >
              {brand.name}
            </span>
          </a>
          {!!brandMenu?.length && (
            <div
              role="menu"
              aria-label={brand.name}
              data-brand-menu
              hidden={!logoOpen}
              onKeyDown={listKeys}
              className={cn(POPOVER, "pill-navbar-pop left-0 grid min-w-40 gap-px before:absolute before:inset-x-0 before:-top-2.5 before:h-2.5")}
            >
              {brandMenu.map((m) => {
                const MIcon = m.icon;
                return (
                  <a
                    key={m.href + m.label}
                    role="menuitem"
                    href={m.href}
                    onClick={closeAll}
                    className="flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13.5px] outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                  >
                    {MIcon && <MIcon className="size-4 text-muted-foreground" />}
                    {m.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {hasOp && (
          <span
            inert={!folded}
            className={cn(
              "flex h-full min-w-0 items-center gap-2 overflow-hidden",
              folded
                ? "visible flex-1 max-w-[1200px] opacity-100 [transition:max-width_.4s_cubic-bezier(.51,.03,.48,.96),opacity_.25s_.15s,visibility_0s]"
                : "invisible max-w-0 flex-none opacity-0 [transition:max-width_.4s_cubic-bezier(.51,.03,.48,.96),opacity_.2s,visibility_0s_.4s]",
              "motion-reduce:transition-none",
            )}
          >
            <button
              ref={chip}
              type="button"
              aria-haspopup="true"
              aria-expanded={opOpen}
              aria-controls={`${id}-sections`}
              aria-label={`On this page: ${sections[current]?.title}`}
              onMouseEnter={() => opHover(true)}
              onMouseLeave={() => opHover(false)}
              onClick={(e) => {
                e.stopPropagation();
                window.clearTimeout(timers.current.op);
                if (HOVER && e.detail && opOpen) return;
                showOp(!opOpen);
                if (!opOpen && e.detail === 0) pendingFocus.current = `#${CSS.escape(`${id}-sections`)} a[aria-current]`;
              }}
              className={cn(
                "flex h-[38px] min-w-0 flex-1 items-center gap-2 rounded-full pl-3.5 pr-3 text-sm font-semibold text-primary outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                opOpen ? "bg-primary/15" : "bg-primary/10 hover:bg-primary/15",
              )}
            >
              <span className="min-w-0 flex-1 truncate text-left">{sections[current]?.title}</span>
              <span className="h-[3px] w-10 shrink-0 overflow-hidden rounded-sm bg-primary/20 max-[600px]:hidden" aria-hidden>
                <i className="block h-full rounded-sm bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} />
              </span>
              <ChevronDown className={cn("size-3 shrink-0 transition-transform duration-200", opOpen && "rotate-180")} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Scroll to top"
              title="Scroll to top"
              onClick={() => goTo(null)}
              className="ml-auto grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors duration-200 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowUp className="size-4" />
            </button>
          </span>
        )}

        {compact && !folded && (
          <button
            ref={menuBtn}
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-nav`}
            onClick={(e) => {
              e.stopPropagation();
              if (expanded) return closeAll();
              setLogoOpen(false);
              setExpanded(true);
              if (e.detail === 0) pendingFocus.current = `[data-nav] a, [data-nav] button`;
            }}
            className={cn(navItem, "ml-1 h-10 gap-1.5 font-semibold")}
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
                  "absolute inset-x-0 top-[calc(100%+6px)] z-10 flex max-h-[70vh] flex-col overflow-y-auto rounded-[18px] border bg-popover p-2 text-popover-foreground shadow-[0_24px_64px_rgb(0_0_0/0.16),0_4px_12px_rgb(0_0_0/0.06)] motion-reduce:transition-none",
                  expanded ? FADE_IN : FADE_OUT,
                )
              : cn(
                  "flex h-full items-center motion-reduce:transition-none",
                  folded
                    ? "pointer-events-none invisible max-w-0 overflow-hidden opacity-0 [transition:max-width_.4s_cubic-bezier(.51,.03,.48,.96)_.12s,opacity_.15s,visibility_0s_.5s]"
                    : "visible max-w-[760px] opacity-100 [transition:max-width_.4s_cubic-bezier(.51,.03,.48,.96)_.1s,opacity_.2s_.4s,visibility_0s]",
                ),
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
                    className={cn(navItem, "whitespace-nowrap", compact && cn(compactRow, "font-semibold"))}
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
                    setLogoOpen(false);
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
                  className={cn(navItem, "gap-1 whitespace-nowrap", isOpen && "before:bg-accent", compact && cn(compactRow, "font-semibold"))}
                >
                  {item.label}
                  {compact && (
                    <ChevronDown
                      className={cn("size-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-180")}
                    />
                  )}
                </button>
                <div
                  id={panelId}
                  role="group"
                  aria-label={item.label}
                  data-panel={item.label}
                  inert={!isOpen}
                  onKeyDown={listKeys}
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
                      {col.heading && <p className="px-2.5 pb-1.5 pt-1 text-xs text-muted-foreground">{col.heading}</p>}
                      {col.links.map((link) => {
                        const LIcon = link.icon;
                        return (
                          <a
                            key={link.href + link.label}
                            href={link.href}
                            onClick={closeAll}
                            className="flex items-center gap-3 rounded-[9px] px-2.5 py-2 outline-none transition-colors duration-150 hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                          >
                            {LIcon && (
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted text-primary">
                                <LIcon className="size-4" />
                              </span>
                            )}
                            <span className="flex min-w-0 flex-col leading-tight">
                              <b className="text-sm font-medium">{link.label}</b>
                              {link.description && <small className="truncate text-xs text-muted-foreground">{link.description}</small>}
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
          <ul className="flex h-full shrink-0 items-center">
            {actions.map((a) => (
              <li key={a.label} className={cn("h-full", small && !a.primary && "hidden")}>
                <a
                  href={a.href}
                  className={cn(
                    navItem,
                    "whitespace-nowrap px-[18px] before:h-[38px]",
                    a.primary && "font-semibold text-primary-foreground before:bg-primary hover:before:bg-primary/90",
                  )}
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {hasOp && (
          <div
            id={`${id}-sections`}
            hidden={!opOpen}
            onMouseEnter={() => opHover(true)}
            onMouseLeave={() => opHover(false)}
            onKeyDown={listKeys}
            style={{ left: opLeft }}
            className={cn(POPOVER, "pill-navbar-pop grid w-max min-w-44 gap-px before:absolute before:inset-x-0 before:-top-2.5 before:h-2.5")}
          >
            <p className="px-2.5 pb-1 pt-1.5 text-xs text-muted-foreground">On this page</p>
            {sections.map((s, k) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={k === current ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(s);
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  k === current ? "bg-primary/10 text-primary" : "hover:bg-accent",
                )}
              >
                <span className={cn("size-1 shrink-0 rounded-full", k === current ? "bg-primary" : "bg-muted-foreground/50")} />
                {s.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {tools.length > 0 && (
        <nav aria-label="Quick actions" className="absolute right-4 top-0 flex h-14 items-center gap-1 max-[1000px]:hidden">
          {tools.map((t) => {
            const TIcon = t.icon;
            const cls =
              "relative grid size-[38px] place-items-center rounded-[10px] text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring after:pointer-events-none after:absolute after:right-0 after:top-[calc(100%+4px)] after:whitespace-nowrap after:rounded-[10px] after:border after:bg-popover after:px-[11px] after:py-[9px] after:text-[13px] after:font-medium after:leading-none after:text-popover-foreground after:opacity-0 after:shadow-[0_10px_26px_rgb(0_0_0/0.14)] after:transition-opacity after:content-[attr(data-tip)] hover:after:opacity-100 focus-visible:after:opacity-100";
            return t.href ? (
              <a key={t.label} href={t.href} aria-label={t.label} data-tip={t.label} className={cls}>
                <TIcon className="size-5" />
              </a>
            ) : (
              <button key={t.label} type="button" onClick={t.onClick} aria-label={t.label} data-tip={t.label} className={cls}>
                <TIcon className="size-5" />
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
