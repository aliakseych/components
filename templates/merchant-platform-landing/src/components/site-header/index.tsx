import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { gsap, useGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Link = { label: string; href: string };

export type SiteHeaderProps = {
  brandName: string;
  nav: Link[];
  cta: Link;
  languages: { code: string; label: string }[];
};

function LangSwitcher({ languages, up = false }: { languages: SiteHeaderProps["languages"]; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(languages[0].code);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClose = () => setOpen(false);
    document.addEventListener("click", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("closeLangSwitcher", onClose);
    return () => {
      document.removeEventListener("click", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("closeLangSwitcher", onClose);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-header-item
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-sm text-base font-medium text-white/90 transition-colors outline-none hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
      >
        {code.toUpperCase()}
        <span className="text-white/60">
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
        </span>
      </button>
      {open && (
        <div role="listbox" className={cn("absolute z-10 min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-ink shadow-xl", up ? "bottom-full left-0 mb-2" : "right-0 mt-2")}>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === code}
              onClick={() => {
                setCode(l.code);
                setOpen(false);
              }}
              className={cn("block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none", l.code === code ? "text-sky" : "text-white/90")}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Fixed header: slides away on scroll down, returns on scroll up, gains a border after 24px. Below xl it collapses into a burger panel. */
export function SiteHeader({ brandName, nav, cta, languages }: SiteHeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef(false);
  menuRef.current = menu;

  useGsap(ref, () => {
    gsap.from("[data-header-item]", { y: -18, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power2.out", delay: 0.15, clearProps: "transform,opacity,visibility" });
  });

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      if (menuRef.current) {
        setHidden(false);
      } else if (y > last && y > 72) {
        setHidden(true);
        window.dispatchEvent(new Event("closeLangSwitcher"));
      } else if (y < last) {
        setHidden(false);
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setMenu(false);
  const linkCls = "flex items-center gap-1 rounded-sm text-base font-medium text-white/90 transition-colors outline-none hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky";

  return (
    <header
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-ink transition-transform duration-500 motion-reduce:transition-none",
        solid ? "border-b border-white/10" : "border-b border-transparent",
        hidden && !menu && "-translate-y-full",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-4 sm:px-6 md:px-[90px]">
        <a href="#top" data-header-item className="shrink-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky" aria-label={brandName}>
          <Logo name={brandName} className="text-[22px] sm:text-[25px]" />
        </a>
        <nav aria-label="Main" className="ml-10 hidden items-center gap-8 xl:flex">
          {nav.map((l) => (
            <a key={l.label} href={l.href} data-header-item className={linkCls}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-6 xl:flex">
          <LangSwitcher languages={languages} />
          <a href={cta.href} data-header-item className="rounded-full bg-white px-[22px] py-[10px] text-base font-semibold text-ink transition-[scale] duration-300 outline-none hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
            {cta.label}
          </a>
        </div>
        <button
          type="button"
          data-header-item
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu((v) => !v)}
          className="relative z-10 ml-auto flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-sky xl:hidden"
        >
          <span className={cn("absolute h-[1.5px] w-5 bg-white transition-transform duration-300", menu ? "rotate-45" : "-translate-y-[5px]")} />
          <span className={cn("absolute h-[1.5px] w-5 bg-white transition-opacity duration-200", menu ? "opacity-0" : "opacity-100")} />
          <span className={cn("absolute h-[1.5px] w-5 bg-white transition-transform duration-300", menu ? "-rotate-45" : "translate-y-[5px]")} />
        </button>
      </div>
      <div
        id="mobile-menu"
        inert={!menu}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none xl:hidden",
          menu ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-white/10 px-4 pt-4 pb-6 sm:px-6">
            {nav.map((l) => (
              <a key={l.label} href={l.href} onClick={close} className="flex items-center gap-1.5 rounded-sm py-3 text-lg font-medium text-white/90 transition-colors outline-none hover:text-sky focus-visible:outline-2 focus-visible:outline-sky">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-5">
              <LangSwitcher languages={languages} up />
              <a href={cta.href} onClick={close} className="rounded-full bg-white px-[22px] py-[10px] text-base font-semibold text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
                {cta.label}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
