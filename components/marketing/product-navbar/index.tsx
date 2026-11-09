import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductNavbarLink = {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
};

export type ProductNavbarItem =
  | { label: string; href: string; links?: undefined }
  | { label: string; links: ProductNavbarLink[]; href?: undefined };

export type ProductNavbarProps = Omit<ComponentPropsWithoutRef<"header">, "children"> & {
  /** Logo or wordmark. */
  brand: ReactNode;
  brandHref?: string;
  items: ProductNavbarItem[];
  /** Buttons at the right end, such as Contact and Dashboard. */
  actions?: ReactNode;
  /** Label of a menu to show open on first render. */
  defaultOpenMenu?: string;
};

const TRIGGER =
  "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50";

function LinkRow({ link, onNavigate }: { link: ProductNavbarLink; onNavigate: () => void }) {
  const Icon = link.icon;
  return (
    <a
      href={link.href}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-lg p-2 outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-medium">{link.label}</span>
        {link.description && <span className="block text-xs leading-snug text-muted-foreground">{link.description}</span>}
      </span>
    </a>
  );
}

/**
 * A top bar with dropdown menus and plain links. Menus open on click or hover.
 * Arrow Down opens a menu and enters it, Escape closes it and returns focus to its trigger.
 * Below `md` everything collapses into one disclosure panel.
 */
export function ProductNavbar({
  brand,
  brandHref = "#",
  items,
  actions,
  defaultOpenMenu,
  className,
  ...props
}: ProductNavbarProps) {
  const uid = useId();
  const barRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<string | null>(defaultOpenMenu ?? null);
  const [mobileOpen, setMobileOpen] = useState(defaultOpenMenu !== undefined);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  const hoverOpen = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLLIElement>, label: string) => {
    const root = event.currentTarget;
    const trigger = root.querySelector<HTMLButtonElement>("button");
    const links = [...root.querySelectorAll<HTMLAnchorElement>("a")];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "Escape" && openMenu === label) {
      setOpenMenu(null);
      trigger?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (openMenu !== label) {
        setOpenMenu(label);
        requestAnimationFrame(() => root.querySelector("a")?.focus());
      } else {
        links[Math.min(index + 1, links.length - 1)]?.focus();
      }
    } else if (event.key === "ArrowUp" && index >= 0) {
      event.preventDefault();
      if (index === 0) trigger?.focus();
      else links[index - 1]?.focus();
    }
  };

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <header
      ref={barRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && mobileOpen) {
          setMobileOpen(false);
          barRef.current?.querySelector<HTMLButtonElement>("[data-mobile-toggle]")?.focus();
        }
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !barRef.current?.contains(event.relatedTarget as Node)) closeAll();
      }}
      className={cn("relative z-40 w-full border-b bg-background text-foreground", className)}
      {...props}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <a
          href={brandHref}
          className="mr-3 flex items-center gap-2 rounded-md text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {brand}
        </a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center">
            {items.map((item) =>
              item.links ? (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hoverOpen(item.label)}
                  onMouseLeave={hoverClose}
                  onKeyDown={(event) => onMenuKeyDown(event, item.label)}
                >
                  <button
                    type="button"
                    aria-expanded={openMenu === item.label}
                    aria-controls={`${uid}-${item.label}`}
                    onClick={() => setOpenMenu((value) => (value === item.label ? null : item.label))}
                    className={cn(TRIGGER, openMenu === item.label && "text-foreground")}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                        openMenu === item.label && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    id={`${uid}-${item.label}`}
                    hidden={openMenu !== item.label}
                    className="absolute left-0 top-full z-50 pt-2"
                  >
                    <ul className="grid w-[32rem] grid-cols-2 gap-1 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
                      {item.links.map((link) => (
                        <li key={link.href}>
                          <LinkRow link={link} onNavigate={closeAll} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.label}>
                  <a href={item.href} className={TRIGGER}>
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">{actions}</div>

        <button
          type="button"
          data-mobile-toggle
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls={`${uid}-mobile`}
          onClick={() => setMobileOpen((value) => !value)}
          className="ml-auto flex size-9 items-center justify-center rounded-md border outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden"
        >
          {mobileOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        </button>
      </div>

      <div id={`${uid}-mobile`} hidden={!mobileOpen} className="border-t px-4 py-3 md:hidden">
        <nav aria-label="Main, mobile" className="flex flex-col gap-4">
          {items.map((item) =>
            item.links ? (
              <section key={item.label} aria-label={item.label}>
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{item.label}</p>
                <ul className="flex flex-col">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <LinkRow link={link} onNavigate={closeAll} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <a
                key={item.label}
                href={item.href}
                onClick={closeAll}
                className="rounded-md px-2 py-1 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {item.label}
              </a>
            ),
          )}
          {actions && <div className="flex flex-wrap items-center gap-2 border-t pt-3">{actions}</div>}
        </nav>
      </div>
    </header>
  );
}
