import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollPillHeaderLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ScrollPillHeaderProps {
  /** Logo / wordmark node, rendered in both the header and the pill. */
  brand?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  /** Text links shown beside the CTA (below 800px only the first stays in the header; all stay in the pill). */
  links?: ScrollPillHeaderLink[];
  cta?: ScrollPillHeaderLink;
  /** Element (ref or CSS selector) whose bottom edge, once above the viewport, reveals the pill. Defaults to the header itself. */
  boundary?: RefObject<HTMLElement | null> | string;
  /** Header text colour for dark hero backgrounds. */
  onDark?: boolean;
  /** Force the pill visible regardless of scroll (previews). */
  forceShown?: boolean;
  /** Smooth-scroll in-page `#hash` links. */
  smoothAnchors?: boolean;
  className?: string;
}

const linkBase =
  "inline-flex items-center whitespace-nowrap rounded-full border-0 bg-transparent px-4 pb-2 pt-[7px] text-[15px] leading-5 tracking-[-0.23px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[380px]:text-[13px]";

function Item({ item, className }: { item: ScrollPillHeaderLink; className: string }) {
  if (item.href) return <a href={item.href} onClick={item.onClick} className={className}>{item.label}</a>;
  return <button type="button" onClick={item.onClick} className={className}>{item.label}</button>;
}

export function ScrollPillHeader({
  brand = <span className="text-xl font-semibold tracking-tight">Orbit</span>,
  brandHref = "#top",
  brandLabel = "Home",
  links = [{ label: "Manifesto", href: "#manifesto" }],
  cta = { label: "Book a call", href: "#book" },
  boundary,
  onDark = false,
  forceShown = false,
  smoothAnchors = true,
  className,
}: ScrollPillHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const visible = forceShown || shown;

  useEffect(() => {
    let frame = 0;
    const resolve = (): HTMLElement | null => {
      if (typeof boundary === "string") return document.querySelector<HTMLElement>(boundary);
      return boundary?.current ?? headerRef.current;
    };
    const update = () => {
      frame = 0;
      const el = resolve();
      if (el) setShown(el.getBoundingClientRect().bottom <= 0);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [boundary]);

  const onClick = (e: MouseEvent<HTMLElement>) => {
    if (!smoothAnchors || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
    if (!a) return;
    const hash = a.getAttribute("href")!.slice(1);
    const target = hash && hash !== "top" ? document.getElementById(decodeURIComponent(hash)) : null;
    if (hash && hash !== "top" && !target) return;
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduced ? "instant" : "smooth";
    // Tell scroll-driven sections (e.g. the phone hero's scroll hold) this is a programmatic scroll.
    window.dispatchEvent(new Event("psh:programmatic-scroll"));
    if (target) target.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });
  };

  const headerLink = (i: number) =>
    cn(linkBase, onDark ? "text-[#f0f0f0] hover:text-white focus-visible:text-white" : "text-foreground/65 hover:text-foreground", i > 0 && "max-[800px]:hidden");
  const pillLink = cn(linkBase, "h-8 text-foreground/65 hover:text-foreground max-[800px]:px-2 max-[380px]:px-1");
  const headerCta = cn(
    "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full px-[18px] py-2 text-[15px] font-semibold leading-5 tracking-[-0.23px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-[380px]:px-3 max-[380px]:text-[13px]",
  );
  const headerCtaTone = onDark ? "bg-[rgba(240,240,240,.25)] text-white hover:bg-[rgba(240,240,240,.38)]" : "bg-muted text-foreground hover:bg-muted/70";

  return (
    <div className={className} onClick={onClick}>
      <header ref={headerRef} id="top" className={cn("relative z-10 mx-auto flex h-[82px] w-full max-w-[1296px] items-center gap-6 px-12 max-[800px]:h-[76px] max-[800px]:gap-3 max-[800px]:px-6 max-[380px]:gap-2")}>
        <a href={brandHref} aria-label={brandLabel} className={cn("mr-auto flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", onDark ? "text-white" : "text-foreground")}>
          {brand}
        </a>
        <nav aria-label="Primary" className="flex flex-1 justify-end">
          {links.map((l, i) => <Item key={l.label} item={l} className={headerLink(i)} />)}
        </nav>
        <Item item={cta} className={cn(headerCta, headerCtaTone)} />
      </header>

      <header
        aria-label="Floating navigation"
        aria-hidden={!visible}
        inert={!visible}
        className={cn(
          "fixed left-1/2 top-[18px] z-[900] flex w-max max-w-[calc(100vw-32px)] items-center gap-6 rounded-[45px] border border-white/45 bg-background/60 py-3 pl-[22px] pr-3 text-foreground backdrop-blur-[16px]",
          "shadow-[0_134px_18.5px_rgba(240,240,240,0),0_86px_17px_rgba(240,240,240,.03),0_48px_14.5px_rgba(240,240,240,.11),0_21px_10.5px_rgba(240,240,240,.19),0_5px_6px_rgba(240,240,240,.22)] dark:shadow-[0_134px_18.5px_rgba(0,0,0,0),0_86px_17px_rgba(0,0,0,.03),0_48px_14.5px_rgba(0,0,0,.1),0_21px_10.5px_rgba(0,0,0,.16),0_5px_6px_rgba(0,0,0,.2)]",
          "transition-[transform,opacity,visibility] [transition-duration:380ms,260ms,380ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none",
          "max-[800px]:w-[calc(100vw-32px)] max-[800px]:gap-2.5 max-[800px]:py-2.5 max-[800px]:pl-[18px] max-[800px]:pr-2.5 max-[380px]:gap-1.5 max-[380px]:pl-3.5",
          visible ? "visible translate-x-[-50%] translate-y-0 opacity-100" : "invisible pointer-events-none translate-x-[-50%] -translate-y-[110px] opacity-0",
        )}
      >
        <a href={brandHref} aria-label={brandLabel} className="mr-auto flex flex-none items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {brand}
        </a>
        <nav aria-label="Secondary" className="flex w-64 min-w-0 justify-end max-[800px]:w-auto max-[800px]:flex-1">
          {links.map((l) => <Item key={l.label} item={l} className={pillLink} />)}
        </nav>
        <Item item={cta} className={cn(headerCta, "bg-foreground text-background hover:bg-foreground/85 max-[800px]:px-3.5")} />
      </header>
    </div>
  );
}

export default ScrollPillHeader;
