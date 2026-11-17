import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NightCtaAction = { label: string; href: string; variant?: "solid" | "ghost" };

export type NightCtaFooterLink = { label: string; href?: string; onClick?: () => void; icon?: ReactNode; external?: boolean };
export type NightCtaFooterColumn = { heading: string; links: NightCtaFooterLink[] };

export type NightCtaFooter = {
  /** Wordmark or logo shown top-left. */
  brand: ReactNode;
  brandHref?: string;
  /** Short lines under the wordmark (e.g. a name definition). */
  tagline?: ReactNode;
  columns: NightCtaFooterColumn[];
  /** Centred line at the very bottom. */
  legal?: ReactNode;
};

export type NightCtaProps = {
  badge?: ReactNode;
  title: ReactNode;
  actions: NightCtaAction[];
  /** Background image URL; defaults to a built-in dawn skyline drawn in SVG. */
  image?: string;
  /** Horizontal focal point (0-1) kept in view when the card is cropped on narrow screens. */
  focalX?: number;
  footer?: NightCtaFooter;
  className?: string;
};

const SCENE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1296" height="596" viewBox="0 0 1296 596"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2a6b"/><stop offset=".45" stop-color="#2c60ba"/><stop offset=".75" stop-color="#e9a77c"/><stop offset="1" stop-color="#f6cfa3"/></linearGradient><radialGradient id="g" cx=".744" cy=".72" r=".5"><stop offset="0" stop-color="#fff2cf" stop-opacity=".9"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient></defs><rect width="1296" height="596" fill="url(#s)"/><rect width="1296" height="596" fill="url(#g)"/><path d="M0 470c160-40 300-10 470-30s300-50 480-20 240 10 346-10V596H0z" fill="#1d2a4a"/><path d="M0 520c200-20 380 10 600-5s480-20 696 5V596H0z" fill="#0f172a"/><g fill="#070b16"><rect x="880" y="470" width="86" height="40" rx="4"/><rect x="968" y="482" width="30" height="28" rx="4"/><circle cx="900" cy="512" r="9"/><circle cx="944" cy="512" r="9"/><circle cx="982" cy="512" r="9"/><rect x="1010" y="486" width="64" height="30" rx="4"/><circle cx="1030" cy="518" r="8"/><circle cx="1058" cy="518" r="8"/></g></svg>`,
)}`;

function Wing({ flip }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 32"
      className={cn("block h-8 w-[19.55px] text-white opacity-50", flip && "-scale-x-100")}
      fill="currentColor"
    >
      <path d="M20 0C9 2 2 9 0 19c4-3 8-4 12-3-4 1-7 4-9 8 4-2 8-3 11-2-3 2-5 5-6 8 5-3 9-8 12-14z" />
    </svg>
  );
}

const pill =
  "inline-flex min-h-[46px] items-center justify-center rounded-[50px] px-6 py-3 text-[17px] leading-[22px] font-[590] tracking-[-0.43px] whitespace-nowrap transition-[background-color,transform] [transition-duration:200ms,300ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none max-[800px]:px-5 max-[800px]:text-base";

/** Closing call-to-action card over a dawn scene with proof badge, plus an optional site footer. */
export function NightCta({ badge, title, actions, image, focalX = 0.744, footer, className }: NightCtaProps) {
  const card = useRef<HTMLDivElement>(null);
  const bg = image ?? SCENE;

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const mq = matchMedia("(max-width:800px)");
    const img = new Image();
    const update = () => {
      if (!mq.matches) return void el.style.removeProperty("background-position");
      if (!img.naturalWidth) return;
      const { width, height } = el.getBoundingClientRect();
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const diff = width - w;
      const pos = Math.abs(diff) < 0.01 ? 0.5 : (width / 2 - w * focalX) / diff;
      el.style.backgroundPosition = `${Math.max(0, Math.min(1, pos)) * 100}% center`;
    };
    img.addEventListener("load", update);
    img.src = bg;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    return () => {
      img.removeEventListener("load", update);
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, [bg, focalX]);

  return (
    <div className={cn("bg-background text-[#1a1a1a] dark:text-[#f5f5f7]", className)}>
      <section className="mx-auto w-full max-w-[1296px] py-16 max-[1199px]:px-8 max-[800px]:px-6 max-[800px]:py-12 max-[380px]:px-5">
        <div
          ref={card}
          className="relative isolate flex h-[596px] flex-col items-start justify-start max-[800px]:justify-center overflow-hidden rounded-[36px] bg-cover bg-center px-12 py-[136px] max-[800px]:h-[540px] max-[800px]:px-6 max-[800px]:pt-16 max-[800px]:pb-40"
          style={{ backgroundImage: `url("${bg}")` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] [background-image:inherit] [background-position:inherit] bg-cover brightness-[.88] contrast-[1.12]"
          />
          <div className="relative z-10 flex w-full flex-col items-center gap-6 max-[800px]:gap-6">
            {badge ? (
              <div className="flex h-8 items-center gap-1.5 text-[17px] leading-[22px] font-[510] tracking-[-0.43px] text-[#f5f5f5]">
                <Wing />
                <span>{badge}</span>
                <Wing flip />
              </div>
            ) : null}
            <h2 className="text-center text-[56px] leading-[1.08] font-[590] tracking-[-0.23px] text-white max-[800px]:text-[clamp(32px,7vw,44px)]">
              {title}
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-[800px]:gap-2.5">
              {actions.map((a) => (
                <a
                  key={a.href + a.label}
                  href={a.href}
                  className={cn(
                    pill,
                    a.variant === "ghost"
                      ? "bg-[rgba(17,18,20,.13)] text-white hover:bg-[rgba(17,18,20,.22)]"
                      : "bg-white text-[#111214] hover:bg-[#f5f5f5]",
                  )}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      {footer ? <Footer footer={footer} /> : null}
    </div>
  );
}

function Footer({ footer }: { footer: NightCtaFooter }) {
  const link =
    "flex h-[18px] items-center gap-2 text-left text-[15px] leading-5 tracking-[-0.23px] text-[#272228]/65 transition-[color,background-color,opacity,transform] [transition-duration:200ms,200ms,200ms,300ms] [transition-timing-function:ease,ease,ease,cubic-bezier(.22,1,.36,1)] hover:text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:text-[#f5f5f7]/65 dark:hover:text-[#f5f5f7]";
  return (
    <footer className="mx-auto w-full max-w-[1296px] px-12 py-[18px] max-[1199px]:px-8 max-[800px]:px-6 max-[380px]:px-5">
      <div className="grid grid-cols-[minmax(193px,1fr)_repeat(3,156px)] items-start gap-[84px] max-[1199px]:grid-cols-[minmax(193px,1fr)_repeat(3,minmax(110px,140px))] max-[1199px]:gap-8 max-[800px]:grid-cols-2 max-[800px]:gap-x-6 max-[800px]:gap-y-10">
        <div className="flex w-[193px] max-w-full flex-col items-start gap-6">
          <a href={footer.brandHref ?? "/"} className="block h-6 text-xl leading-6 font-semibold tracking-tight">
            {footer.brand}
          </a>
          {footer.tagline ? (
            <div className="text-[15px] leading-5 tracking-[-0.23px] text-[#272228]/65 dark:text-[#f5f5f7]/65">{footer.tagline}</div>
          ) : null}
        </div>
        {footer.columns.map((col) => (
          <div key={col.heading} className="flex flex-col items-start gap-4">
            <h3 className="mb-2 text-[15px] leading-5 font-[590] tracking-[-0.23px]">{col.heading}</h3>
            {col.links.map((l) => {
              const inner = (
                <>
                  {l.icon ? <span aria-hidden className="opacity-65 transition-opacity duration-200 group-hover:opacity-100">{l.icon}</span> : null}
                  {l.label}
                </>
              );
              return l.href ? (
                <a key={l.label} href={l.href} className={cn(link, "group")} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {inner}
                </a>
              ) : l.onClick ? (
                <button key={l.label} type="button" onClick={l.onClick} className={cn(link, "group")}>
                  {inner}
                </button>
              ) : (
                <span key={l.label} className={link}>{inner}</span>
              );
            })}
          </div>
        ))}
      </div>
      {footer.legal ? (
        <div className="mt-[156px] text-center text-[15px] leading-5 tracking-[-0.23px] text-[#272228]/65 max-[800px]:mt-20 dark:text-[#f5f5f7]/65">
          {footer.legal}
        </div>
      ) : null}
    </footer>
  );
}
