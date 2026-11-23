import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCardArt, SofaArt, WarehouseArt } from "@/sample/art";
import { gsap, useGsap } from "@/lib/motion";

export type HeroProps = {
  eyebrows: string[];
  title: string;
  sub: string;
  cta: { label: string; href: string };
  pains: { title: string; body: string }[];
};

/** Hero: rotating eyebrow, headline, floating image collage that drifts and parallaxes, then three pain cards. */
export function Hero({ eyebrows, title, sub, cta, pains }: HeroProps) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, () => {
    gsap.timeline({ defaults: { ease: "power3.out" } }).from("[data-hero-copy]", { y: 56, autoAlpha: 0, duration: 1.1, stagger: 0.14 });

    gsap.to("[data-hero-visual]", { y: -60, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    for (const f of [
      { target: "[data-hero-float-1]", y: -15, duration: 3 },
      { target: "[data-hero-float-2]", y: -20, duration: 4.2 },
      { target: "[data-hero-float-3]", y: 12, duration: 3.5 },
    ]) {
      gsap.to(f.target, { y: f.y, duration: f.duration, ease: "sine.inOut", yoyo: true, repeat: -1, force3D: true });
    }

    const phrases = gsap.utils.toArray<HTMLElement>("[data-eyebrow-phrase]");
    if (phrases.length === 2) {
      const [a, b] = phrases;
      gsap.set(a, { y: "0%", autoAlpha: 1 });
      gsap.set(b, { y: "100%", autoAlpha: 0 });
      gsap
        .timeline({ repeat: -1 })
        .to(a, { y: "-100%", autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 2.6)
        .to(b, { y: "0%", autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "<0.08")
        .set(a, { y: "100%", autoAlpha: 0 })
        .to(b, { y: "-100%", autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "+=2.6")
        .to(a, { y: "0%", autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "<0.08")
        .set(b, { y: "100%", autoAlpha: 0 });
    }

    gsap.from("[data-pain-card]", { y: 64, autoAlpha: 0, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: "[data-pain-grid]", start: "top 82%", once: true } });
  });

  return (
    <section id="top" ref={ref} className="relative overflow-hidden bg-ink pt-[72px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[190px] right-[-140px] size-[560px] rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, rgba(27,88,133,0.55) 0%, rgba(27,88,133,0.18) 55%, transparent 75%)", filter: "blur(60px)" }}
      />
      <div className="container-own relative grid items-center gap-16 pb-10 pt-16 lg:grid-cols-2 lg:pb-0 lg:pt-24">
        <div className="max-w-[583px]">
          <p data-hero-copy className="pb-2 text-base font-medium uppercase tracking-[-0.16px] text-white">
            <span className="sr-only">{eyebrows.join(". ")}</span>
            <span aria-hidden className="grid overflow-hidden">
              {eyebrows.map((e, i) => (
                <span key={e} data-eyebrow-phrase className={i === 0 ? "col-start-1 row-start-1" : "col-start-1 row-start-1 opacity-0 motion-reduce:hidden"}>
                  {e}
                </span>
              ))}
            </span>
          </p>
          <h1 data-hero-copy className="font-display text-[40px] leading-[1.14] tracking-[-1.12px] text-white sm:text-[56px]">
            {title}
          </h1>
          <p data-hero-copy className="pt-4 text-xl leading-7 font-light text-white/70">
            {sub}
          </p>
          <div data-hero-copy className="pt-6">
            <a href={cta.href} className="group inline-flex items-center gap-2.5 rounded-full bg-sky px-[26px] py-[14px] text-lg text-[#171e16] transition-colors duration-300 outline-none hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
              {cta.label}
              <ChevronRight aria-hidden className="size-5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
        <div data-hero-visual className="relative mx-auto aspect-[536/477] w-full max-w-[536px] pt-12 lg:pt-0">
          <div data-hero-float-3 className="absolute top-0 left-[40.11%] z-10 w-[59.88%] will-change-transform">
            <div className="overflow-hidden rounded-[24px]"><WarehouseArt className="block h-auto w-full" /></div>
          </div>
          <div data-hero-float-2 className="absolute bottom-0 left-[8.39%] z-20 w-[41.04%] will-change-transform">
            <div className="overflow-hidden rounded-[16px]"><ProductCardArt className="block h-auto w-full" /></div>
          </div>
          <div data-hero-float-1 className="absolute top-0 left-0 z-30 w-[30.78%] will-change-transform">
            <div className="overflow-hidden rounded-[16px]"><SofaArt className="block h-auto w-full" /></div>
          </div>
        </div>
      </div>
      <div className="container-own relative pb-16 pt-14 lg:pt-20">
        <div data-pain-grid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-x-8 gap-y-10">
          {pains.map((p) => (
            <article key={p.title} data-pain-card className="flex flex-col gap-3 border-t border-white/15 pt-6">
              <h2 className="font-display text-[28px] leading-[1.15] tracking-[-0.56px] text-balance text-white">{p.title}</h2>
              <p className="max-w-[36ch] text-lg leading-7 font-light text-pretty text-white/70">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
