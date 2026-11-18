import { CallToAction, Faq, Footer } from "@/components/closing";
import { Features } from "@/components/features";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Logos } from "@/components/logos";

export function App({ menuOpen = false }: { menuOpen?: boolean }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-page font-sans text-olive-950 dark:text-white">
      <Header menuOpen={menuOpen} />
      <main>
        <Hero />
        <Logos />
        <Features />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
