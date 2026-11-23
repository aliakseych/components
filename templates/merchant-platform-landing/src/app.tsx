import { useEffect } from "react";
import { BadgeCheck, CreditCard, LayoutDashboard, Megaphone, Scale, Search, Store, UserRound } from "lucide-react";
import { config } from "./template.config";
import * as c from "./sample/content";
import { AppIconArt, CardsArt, CouriersArt, DiagramArt, PartnerMark, PhotoArt, SocialGlyph } from "./sample/art";
import { ScrollTrigger } from "./lib/motion";
import { SiteHeader } from "./components/site-header";
import { Hero } from "./components/hero";
import { DesignStrip } from "./components/design-strip";
import { ProductShowcase } from "./components/product-showcase";
import { AcceptingPayment } from "./components/accepting-payment";
import { PaymentDelivery } from "./components/payment-delivery";
import { RunEveryChannel } from "./components/run-every-channel";
import { Testimonial } from "./components/testimonial";
import { FoundInSearch } from "./components/found-in-search";
import { Compare } from "./components/compare";
import { Blog } from "./components/blog";
import { Faq } from "./components/faq";
import { ClosingCta } from "./components/closing-cta";
import { SiteFooter } from "./components/site-footer";
import { ConsentBanner } from "./components/consent-banner";

const art = { cards: <CardsArt className="h-auto w-full" />, couriers: <CouriersArt className="h-auto w-full" />, app: <AppIconArt className="h-auto w-full" /> };
const icon = "size-7";
const advIcons = [Store, CreditCard, LayoutDashboard, Megaphone, Scale, BadgeCheck];

export function App({ consent = false }: { consent?: boolean }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <div className="min-h-screen bg-page font-sans text-fg antialiased">
      <SiteHeader brandName={config.brandName} nav={config.nav} cta={config.cta} languages={config.languages} />
      <main>
        <Hero {...c.hero} cta={config.cta} />
        <section className="overflow-hidden bg-ink pt-24">
          <DesignStrip {...c.design} />
          <div className="bg-black pb-16">
            <ProductShowcase {...c.products} />
            <AcceptingPayment {...c.paid} />
          </div>
        </section>
        <PaymentDelivery
          {...c.connections}
          rows={c.connections.rows.map((r) => ({ label: r.label, title: r.title, badge: "badge" in r ? r.badge : undefined, art: art[r.art] }))}
          logos={Array.from({ length: 8 }, (_, i) => <PartnerMark key={i} index={i} />)}
        />
        <RunEveryChannel {...c.advantages} items={c.advantages.items.map((it, i) => { const I = advIcons[i]; return { ...it, icon: <I aria-hidden className={icon} strokeWidth={1.75} /> }; })} />
        <Testimonial {...c.testimonial} />
        <FoundInSearch
          {...c.features}
          items={c.features.items.map((it, i) => { const I = [Search, UserRound, CreditCard][i]; return { ...it, icon: <I aria-hidden className="size-5" /> }; })}
          diagram={<DiagramArt className="block h-auto w-full" />}
        />
        <Compare {...c.compare} />
        <Blog {...c.blog} posts={c.blog.posts.map((p) => ({ ...p, image: <PhotoArt className="size-full" /> }))} />
        <Faq {...c.faq} />
        <ClosingCta {...c.cta} />
      </main>
      <SiteFooter
        brandName={config.brandName}
        nav={[...config.nav, { label: "FAQ", href: "#faq" }]}
        phone={config.phone}
        email={config.email}
        legal={config.legal}
        privacy={{ label: c.cta.privacyLink, href: "#cta" }}
        socials={config.socials.map((s, i) => ({ ...s, icon: <SocialGlyph kind={i} className="size-8" /> }))}
      />
      {consent && <ConsentBanner {...c.consent} />}
    </div>
  );
}
