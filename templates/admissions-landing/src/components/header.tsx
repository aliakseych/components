import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav, type NavLink } from "@/sample/content";
import { config, Wordmark } from "@/template.config";
import { ButtonLink, Container, focusRing } from "./ui";

function SmallChevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" fill="none" aria-hidden="true" className={cn("transition-transform", open && "rotate-180")}>
      <path d="M2 3.75l3 3 3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Disclosure-style menu button: Enter/Space/ArrowDown opens, arrows move, Escape closes and returns focus. */
function NavMenu({ label, items }: { label: string; items: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const focusOnOpen = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const links = root.current?.querySelectorAll<HTMLAnchorElement>("[role=menuitem]");
    if (focusOnOpen.current !== null && links?.length) {
      links[(focusOnOpen.current + links.length) % links.length].focus();
      focusOnOpen.current = null;
    }
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openAt = (index: number) => {
    focusOnOpen.current = index;
    setOpen(true);
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") (e.preventDefault(), openAt(0));
    if (e.key === "ArrowUp") (e.preventDefault(), openAt(-1));
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>("[role=menuitem]")];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const move = (n: number) => (e.preventDefault(), links[(n + links.length) % links.length].focus());
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(-1);
    else if (e.key === "Escape") (setOpen(false), button.current?.focus());
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? setOpen(false) : openAt(0))}
        onKeyDown={onButtonKey}
        className={cn("inline-flex items-center gap-1 rounded-sm text-sm/7 text-olive-950 dark:text-white", focusRing)}
      >
        {label}
        <SmallChevron open={open} />
      </button>
      {open && (
        <div
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className="absolute top-full left-1/2 z-40 mt-3 w-72 -translate-x-1/2 rounded-xl bg-background p-2 shadow-lg ring-1 ring-olive-950/10 dark:bg-olive-900 dark:ring-white/10"
        >
          {items.map((item) => (
            <a
              key={item.label}
              role="menuitem"
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 outline-none hover:bg-olive-950/5 focus-visible:bg-olive-950/5 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
            >
              <span className="block text-sm/6 font-medium text-olive-950 dark:text-white">{item.label}</span>
              <span className="block text-xs/5 text-olive-700 dark:text-olive-400">{item.description}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const link = "block rounded-md px-3 py-2 text-base/7 text-olive-950 hover:bg-olive-950/5 dark:text-white dark:hover:bg-white/5";
  return (
    <dialog
      ref={ref}
      aria-label="Menu"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="menu-dialog fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-page p-0 text-olive-950 dark:text-white"
    >
      <div className="px-6 md:px-10">
        <div className="flex h-[5.25rem] items-center justify-between">
          <a href="#hero" onClick={onClose} className={cn("rounded-sm", focusRing)}>
            <Wordmark />
          </a>
          <button type="button" onClick={onClose} aria-label="Close menu" className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-olive-950/10 dark:hover:bg-white/10", focusRing)}>
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex flex-col gap-6 pt-2 pb-10" aria-label="Mobile">
          <a href={nav.links[0].href} onClick={onClose} className={link}>
            {nav.links[0].label}
          </a>
          {nav.menus.map((menu) => (
            <div key={menu.label}>
              <p className="px-3 text-xs/6 font-medium tracking-wide text-olive-600 uppercase dark:text-olive-400">{menu.label}</p>
              {menu.items.map((item) => (
                <a key={item.label} href={item.href} onClick={onClose} className={link}>
                  {item.label}
                </a>
              ))}
            </div>
          ))}
          {nav.links.slice(1).map((item) => (
            <a key={item.label} href={item.href} onClick={onClose} className={link}>
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 border-t border-olive-950/10 pt-6 dark:border-white/10">
            <ButtonLink href={config.login.href} variant="ghost" onClick={onClose}>
              {config.login.label}
            </ButtonLink>
            <ButtonLink href={config.cta.href} onClick={onClose}>
              {config.cta.label}
            </ButtonLink>
          </div>
        </nav>
      </div>
    </dialog>
  );
}

export function Header({ menuOpen: initialMenu = false }: { menuOpen?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(initialMenu);
  const [pricing, blog] = nav.links;
  const link = cn("rounded-sm text-sm/7 text-olive-950 dark:text-white", focusRing);
  return (
    <header className="sticky top-0 z-30 bg-page">
      <Container>
        <div className="flex h-[5.25rem] items-center gap-4">
          <div className="flex flex-1 items-center">
            <a href="#hero" aria-label={`${config.brandName} home`} className={cn("inline-flex h-10 w-[120px] items-center rounded-sm", focusRing)}>
              <Wordmark />
            </a>
          </div>
          <nav aria-label="Main" className="flex items-center gap-8 max-lg:hidden">
            <a href={pricing.href} className={link}>
              {pricing.label}
            </a>
            {nav.menus.map((m) => (
              <NavMenu key={m.label} label={m.label} items={m.items} />
            ))}
            <a href={blog.href} className={link}>
              {blog.label}
            </a>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-3">
            <ButtonLink href={config.login.href} variant="ghost" size="sm" className="font-normal max-sm:hidden">
              {config.login.label}
            </ButtonLink>
            <ButtonLink href={config.cta.href} size="sm" className="font-normal">
              {config.cta.label}
            </ButtonLink>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-olive-950/10 lg:hidden dark:hover:bg-white/10", focusRing)}
            >
              <svg viewBox="0 0 22 22" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M3.5 7h15M3.5 15h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </Container>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
