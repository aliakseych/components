import { useEffect } from "react";
import Lenis from "lenis";
import "@fontsource-variable/manrope";
import { Globe } from "@/components/globe";
import { Intro } from "@/components/landing/intro";
import { Documents, Footer, Hero, Nav, PlanLinks } from "@/components/landing/page";
import { config } from "@/template.config";
import { copy, journeyStrings } from "@/sample/content";
import { assetUrl, journey, mediaUrl } from "@/sample/journey";

export function App({ intro = true }: { intro?: boolean }) {
  // Smooth scroll; off under reduced motion. Anchor clicks scroll through Lenis.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 0.9, wheelMultiplier: 1.4, touchMultiplier: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return () => lenis.destroy();
  }, []);
  return (
    <>
      {intro && <Intro brandName={config.brandName} />}
      <a href="#main" className="skip-link">{copy.skip}</a>
      <Nav />
      <main id="main">
        <Hero />
        <Globe journey={journey} media={mediaUrl} asset={assetUrl} strings={journeyStrings} />
        <PlanLinks />
        <Documents />
      </main>
      <Footer />
    </>
  );
}
