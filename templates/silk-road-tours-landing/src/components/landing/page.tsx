// Page sections: nav pill, hero, plan doors, legal documents, footer with photo credits.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, FileText, Globe, Menu, X } from "lucide-react";
import { config } from "@/template.config";
import { copy } from "@/sample/content";
import { credits } from "@/sample/journey";
import stilllife from "@/assets/crafts/stilllife.webp";
import contactsArt from "@/assets/crafts/contacts.webp";
import adrasHero from "@/assets/textures/adras-hero.webp";
import adrasFooter from "@/assets/textures/adras-footer.webp";
import { Section } from "./section";
import { SunMark } from "./sun-mark";

function Popover({ open, onClose, label, className, children }: { open: boolean; onClose: () => void; label: string; className: string; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(".yn-item")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus({ preventScroll: true }); };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="yn-layer">
      <div className="yn-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={label} className={`yn-pop ${className}`}>
        <button type="button" className="yn-pop-close" onClick={onClose} aria-label={copy.nav.close} />
        <p className="yn-pop-title">{label}</p>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<"lang" | "menu" | null>(null);
  const close = useCallback(() => setMenu(null), []);
  useEffect(() => {
    // Chromium also refracts the backdrop through the SVG displacement filter below.
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    if (brands?.some((b) => b.brand === "Chromium")) document.documentElement.classList.add("yn-refract");
    const update = () => setScrolled(scrollY > (document.getElementById("top")?.offsetHeight ?? innerHeight) * 0.7);
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  const current = config.languages.find((l) => l.code === config.currentLanguage) ?? config.languages[0];
  return (
    <header className="yn-header" data-nav data-scrolled={scrolled || undefined}>
      <nav aria-label={copy.nav.label} className="yn-pill">
        <a data-brand-target href="#top" aria-label={`${config.brandName} ${copy.nav.home}`} className="yn-logo"><SunMark name={config.brandName} /></a>
        <ul className="yn-links">{copy.nav.links.map((l) => <li key={l.href}><a href={l.href} className="yn-link">{l.label}</a></li>)}</ul>
        <div className="yn-end">
          <button type="button" className="yn-btn" aria-expanded={menu === "lang"} aria-haspopup="dialog" aria-label={copy.nav.language(current.label)} onClick={() => setMenu(menu === "lang" ? null : "lang")}>
            <Globe size={20} strokeWidth={1.5} aria-hidden="true" /><span className="yn-btn-code" aria-hidden="true">{current.code.slice(0, 2).toUpperCase()}</span>
          </button>
          <button type="button" className="yn-btn yn-mobile-only" aria-expanded={menu === "menu"} aria-haspopup="dialog" aria-label={menu === "menu" ? copy.nav.menuClose : copy.nav.menuOpen} onClick={() => setMenu(menu === "menu" ? null : "menu")}>
            {menu === "menu" ? <X size={20} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.5} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <Popover open={menu === "lang"} onClose={close} label={copy.nav.languageList} className="yn-pop--lang">
        <ul className="yn-list">{config.languages.map((l) => <li key={l.code}><a href={l.href} lang={l.code} hrefLang={l.code} className="yn-item" aria-current={l === current ? "true" : undefined} onClick={close}>{l.label}</a></li>)}</ul>
      </Popover>
      <Popover open={menu === "menu"} onClose={close} label={copy.nav.sections} className="yn-pop--menu">
        <ul className="yn-list">{copy.nav.links.map((l) => <li key={l.href}><a href={l.href} className="yn-item yn-item--lg" onClick={close}>{l.label}</a></li>)}</ul>
      </Popover>
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="yn-defs">
        <filter id="yn-refract" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="hero" data-tone="sun" aria-labelledby="top-h" style={{ ["--adras" as string]: `url("${adrasHero}")` }}>
      <div className="container-site hero-inner">
        <h1 id="top-h" className="hero-title">{copy.hero.heading}</h1>
        <p className="hero-sub">{copy.hero.sub}</p>
        <div className="hero-ctas">
          <a href="#journey" className="cta cta-primary">{copy.hero.primary}<ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" /></a>
          <a href={config.links.travel} className="cta cta-secondary">{copy.hero.secondary}</a>
        </div>
      </div>
    </section>
  );
}

export function PlanLinks() {
  const doors = [
    { ...copy.plan.travel, href: config.links.travel, art: stilllife, sun: true },
    { ...copy.plan.contacts, href: config.links.contacts, art: contactsArt, sun: false },
  ];
  return (
    <Section tone="cream" id="plan" labelledby="plan-h">
      <h2 id="plan-h" className="plan-h">{copy.plan.heading}</h2>
      <ul className="plan-grid">
        {doors.map((d) => (
          <li key={d.title} className={d.sun ? "door door-sun" : "door"}>
            <a href={d.href} className="door-a">
              <span className="door-copy">
                <span className="door-title">{d.title}</span>
                <span className="door-body">{d.body}</span>
                <span className="door-go">{copy.plan.open}<ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></span>
              </span>
              <img src={d.art} alt="" loading="lazy" decoding="async" className={d.sun ? "door-img" : "door-img door-img-sm"} />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Placeholder document preview: a paper sheet with title lines instead of a real scan. */
function DocSheet({ title, number }: { title: string; number: string }) {
  return (
    <span className="ld-scan" role="img" aria-label={copy.trust.previewAlt(title)}>
      <span className="ld-sheet"><span className="ld-sheet-t">{title}</span><span className="ld-sheet-n">№ {number}</span>{Array.from({ length: 6 }, (_, i) => <span key={i} className="ld-sheet-l" />)}<span className="ld-sheet-seal" /></span>
    </span>
  );
}

export function Documents() {
  return (
    <Section id="trust" tone="ink" edge="arch" labelledby="trust-h">
      <h2 id="trust-h" className="ld-h">{copy.trust.heading}</h2>
      <ul className="ld-grid">
        {config.documents.map((d, i) => {
          const meta = `№ ${d.number} · ${d.year} · ${d.issuer}`;
          return (
            <li key={d.title} className={i > 0 ? "ld-doc ld-doc-secondary" : "ld-doc"}>
              <a href={d.href} className="ld-card" target="_blank" rel="noopener">
                <DocSheet title={d.title} number={d.number} />
                <span className="ld-copy"><span className="ld-title">{d.title}</span><span className="ld-meta">{meta}</span></span>
              </a>
              <a href={d.href} className="ld-link" target="_blank" rel="noopener">
                <FileText size={20} strokeWidth={1.5} aria-hidden="true" className="ld-ic" />
                <span className="ld-copy"><span className="ld-title">{d.title}</span><span className="ld-meta">{meta}</span></span>
              </a>
            </li>
          );
        })}
      </ul>
      <a href={config.links.legal} className="ld-all">{copy.trust.all}<ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></a>
    </Section>
  );
}

function PhotoCredits() {
  const ref = useRef<HTMLDialogElement>(null);
  const f = copy.footer;
  return (
    <>
      <button type="button" className="foot-a" onClick={() => ref.current?.showModal()}>{f.photos}</button>
      <dialog ref={ref} className="pc" aria-labelledby="pc-h" onClick={(e) => e.target === ref.current && ref.current.close()}>
        <div className="pc-head"><h2 id="pc-h" className="pc-title">{f.photos}</h2><button type="button" className="pc-close" aria-label={f.close} onClick={() => ref.current?.close()}>×</button></div>
        <ul className="pc-list" data-lenis-prevent>
          {credits.map((r) => (
            <li key={r.file}>
              <span className="pc-name">{r.file.split("/").pop()!.replace(/\.\w+$/, "").replace(/-/g, " ")}</span>
              <span>{r.author}{r.license && " · "}{r.licenseUrl ? <a href={r.licenseUrl} rel="noopener license">{r.license}</a> : r.license}{r.source && <> · <a href={r.source} rel="noopener">{f.source}</a></>}</span>
            </li>
          ))}
          <li><span className="pc-name">Sentinel-2 cloudless 2016 (map)</span><span>EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016) · <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener license">CC BY 4.0</a> · <a href="https://s2maps.eu" rel="noopener">{f.source}</a></span></li>
        </ul>
      </dialog>
    </>
  );
}

export function Footer() {
  const f = copy.footer;
  const fmt = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(config.licence.issued));
  const day = (d: number) => new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + d)));
  const links = [
    { label: f.legal, href: config.links.legal },
    { label: f.payments, href: config.links.payments },
    { label: f.how, href: config.links.terms },
    { label: f.travel, href: config.links.travel },
  ];
  return (
    <Section as="footer" id="footer" tone="cream" edge="band" className="foot">
      <div className="foot-art" aria-hidden="true" style={{ ["--foot-art" as string]: `url("${adrasFooter}")` }} />
      <div className="relative grid gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <section aria-labelledby="foot-company" className="grid content-start gap-4">
          <h2 id="foot-company" className="foot-h">{f.company}</h2>
          <p className="font-bold">{config.legalName}</p>
          <dl className="grid gap-4 text-sm">
            <div><dt className="foot-dt">{f.tin}</dt><dd>{config.taxId}</dd></div>
            <div><dt className="foot-dt">{f.licence}</dt><dd>{f.licenceLine(config.licence.number, fmt)}</dd></div>
            <div><dt className="foot-dt">{f.address}</dt><dd>{config.address}</dd></div>
            <div><dt className="foot-dt">{f.hours}</dt><dd>{day(config.hours.days[0])}–{day(config.hours.days[1])}, {config.hours.open}–{config.hours.close}</dd></div>
          </dl>
        </section>
        <section aria-labelledby="foot-contacts" className="grid content-start gap-4">
          <h2 id="foot-contacts" className="foot-h">{f.contacts}</h2>
          <ul className="grid gap-4 text-sm">
            {config.staff.map((p) => (
              <li key={p.name} className="foot-person">
                <p className="font-bold">{p.name}</p>
                <p className="foot-dt">{p.role}</p>
                {p.phone && <a className="foot-a foot-a-tight" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>{p.phone}</a>}
                {p.phone && p.whatsapp && <a className="foot-a foot-a-tight" href={`https://wa.me/${p.phone.replace(/\D/g, "")}`} rel="noopener">{f.whatsapp}</a>}
                {"email" in p && p.email && <a className="foot-a foot-a-tight break-all" href={`mailto:${p.email}`}>{p.email}</a>}
              </li>
            ))}
          </ul>
          <p className="flex flex-wrap gap-x-4 text-sm">{config.socials.map((s) => <a key={s.href} className="foot-a" href={s.href} rel="noopener">{s.label}</a>)}</p>
        </section>
        <nav aria-labelledby="foot-links" className="grid content-start gap-2">
          <h2 id="foot-links" className="foot-h">{f.links}</h2>
          <ul className="foot-list">{links.map((l) => <li key={l.label}><a className="foot-a" href={l.href}>{l.label}</a></li>)}<li><PhotoCredits /></li></ul>
        </nav>
        <nav aria-labelledby="foot-langs" className="grid content-start gap-2">
          <h2 id="foot-langs" className="foot-h">{f.languages}</h2>
          <ul className="foot-list grid-cols-2 gap-x-6">{config.languages.map((l) => <li key={l.code}><a className="foot-a" href={l.href} lang={l.code} hrefLang={l.code} aria-current={l.code === config.currentLanguage ? "true" : undefined}>{l.label}</a></li>)}</ul>
        </nav>
      </div>
      <p className="foot-copy relative mt-14 border-t pt-6 text-sm">© {config.since}–{new Date().getFullYear()} {config.legalName}. {f.rights}</p>
    </Section>
  );
}
