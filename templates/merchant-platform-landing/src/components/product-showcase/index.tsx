import { useRef } from "react";
import { gsap, prefersReducedMotion, useGsap } from "@/lib/motion";
import { cq, usePlayWhenVisible } from "@/lib/stage";

function Plush({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} style={style} preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="100" fill="#d9c7a6" />
      <circle cx="30" cy="30" r="9" fill="#b08a5a" />
      <circle cx="70" cy="30" r="9" fill="#b08a5a" />
      <circle cx="50" cy="48" r="22" fill="#c39a63" />
      <circle cx="43" cy="44" r="2.4" fill="#2b2118" />
      <circle cx="57" cy="44" r="2.4" fill="#2b2118" />
      <ellipse cx="50" cy="54" rx="7" ry="5" fill="#e8cfa5" />
      <rect x="32" y="68" width="36" height="30" rx="14" fill="#c39a63" />
    </svg>
  );
}

const t = (n: number) => ({ fontSize: cq(n) });
const label = "absolute whitespace-nowrap bg-white font-medium text-black";

export type ProductShowcaseProps = { eyebrow: string; title: string; sub: string };

/** "Make your products shine": background swap and generated description on one product, then a catalog row. Scale-in on reveal; the 11s loop plays only on screen. */
export function ProductShowcase({ eyebrow, title, sub }: ProductShowcaseProps) {
  const block = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGsap(block, () => {
    gsap.from("[data-shine-heading]", { y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-shine-heading]", start: "top 82%", once: true } });
    gsap.from("[data-shine-img]", { scale: 1.18, autoAlpha: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: "[data-shine-img]", start: "top 75%", once: true } });
  });

  usePlayWhenVisible(stage, () => {
    if (prefersReducedMotion()) {
      gsap.set("[data-ps]", { autoAlpha: 0 });
      gsap.set("[data-ps-row]", { autoAlpha: 1 });
      return null;
    }
    const q = gsap.utils.selector(stage);
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
    tl.set(q("[data-ps]"), { autoAlpha: 0 }, 0)
      .set(q("[data-ps-card]"), { autoAlpha: 1, width: cq(315), height: cq(148), scale: 0.6 }, 0)
      .set(q("[data-ps-glow]"), { autoAlpha: 0 }, 0)
      .set(q("[data-ps-dot]"), { autoAlpha: 0, scale: 0 }, 0)
      .set(q("[data-ps-bg]"), { autoAlpha: 0 }, 0)
      .set(q("[data-ps-group]"), { autoAlpha: 1, y: 0 }, 0)
      .to(q("[data-ps-card]"), { scale: 1, duration: 0.7 }, 0.3)
      .to(q("[data-ps-dot]"), { autoAlpha: 1, scale: 1, duration: 0.3 }, 0.9)
      .to(q("[data-ps-card]"), { height: cq(210), duration: 0.6 }, 1.3)
      .to(q("[data-ps-glow]"), { autoAlpha: 1, duration: 0.6 }, 1.5)
      .to(q("[data-ps-l1]"), { autoAlpha: 1, duration: 0.4 }, 1.8)
      .to(q("[data-ps-bg]"), { autoAlpha: 1, duration: 0.6 }, 2.8)
      .to(q("[data-ps-l1]"), { autoAlpha: 0, duration: 0.3 }, 3.4)
      .to(q("[data-ps-l2]"), { autoAlpha: 1, duration: 0.4 }, 3.6)
      .fromTo(q("[data-ps-popup]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 4.4)
      .to(q("[data-ps-popup], [data-ps-l2], [data-ps-glow], [data-ps-dot]"), { autoAlpha: 0, duration: 0.4 }, 5.8)
      .to(q("[data-ps-card]"), { autoAlpha: 0, duration: 0.4 }, 6.2)
      .fromTo(q("[data-ps-detail]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, 6.4)
      .to(q("[data-ps-detail]"), { autoAlpha: 0, duration: 0.4 }, 8.0)
      .fromTo(q("[data-ps-row]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, 8.2)
      .fromTo(q("[data-ps-tilt]"), { y: -180, rotate: 14, autoAlpha: 0 }, { y: 0, rotate: -6, autoAlpha: 1, duration: 0.7, ease: "back.out(1.4)" }, 8.7)
      .to(q("[data-ps-group]"), { autoAlpha: 0, duration: 0.6, ease: "power1.in" }, 10.4);
    return tl;
  });

  return (
    <div ref={block} className="pt-32 pb-16">
      <div data-shine-heading className="mx-auto max-w-2xl px-6 text-center">
        <p className="pb-3 text-base font-medium tracking-[-0.16px] text-sky uppercase">{eyebrow}</p>
        <h2 className="font-display text-[34px] leading-tight tracking-[-0.68px] text-white sm:text-[44px] sm:leading-[48.4px] sm:tracking-[-0.88px]">{title}</h2>
        <p className="pt-3 text-lg leading-7 font-light text-white/70">{sub}</p>
      </div>
      <div className="relative mx-auto mt-12 w-full max-w-[1200px] px-6">
        <div data-shine-img className="overflow-hidden rounded-2xl">
          <div ref={stage} role="img" aria-label="Animation: a product photo gets a new background and an AI-written description, then joins the catalog" className="relative aspect-[1260/504] w-full overflow-hidden bg-black" style={{ containerType: "inline-size" }}>
            <div data-ps-group className="absolute inset-0">
              <div data-ps data-ps-card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden" style={{ borderRadius: cq(20) }}>
                <Plush className="size-full" />
                <div data-ps-bg className="absolute inset-0 opacity-0">
                  <Plush className="size-full" style={{ filter: "hue-rotate(160deg) saturate(0.6) brightness(1.15)" }} />
                </div>
              </div>
              <div data-ps data-ps-glow aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: cq(360), height: cq(250), borderRadius: cq(28), boxShadow: `0 0 ${cq(60)} ${cq(8)} rgba(255,180,90,0.45), inset 0 0 0 ${cq(2)} rgba(255,200,120,0.8)` }} />
              <span data-ps data-ps-dot className="absolute rounded-full bg-white" style={{ left: "47%", top: "40%", width: cq(14), height: cq(14), boxShadow: "0 0 12px #fff" }} />
              <span data-ps data-ps-l1 className={label} style={{ ...t(13), left: "58%", top: "62%", padding: `${cq(7)} ${cq(14)}`, borderRadius: cq(18) }}>Replace background</span>
              <span data-ps data-ps-l2 className={label} style={{ ...t(13), left: "58%", top: "62%", padding: `${cq(7)} ${cq(14)}`, borderRadius: cq(18) }}>Generate product description</span>
              <div data-ps data-ps-popup className="absolute bg-white text-black" style={{ left: "63%", top: "24%", width: cq(250), padding: cq(14), borderRadius: cq(14), ...t(11), lineHeight: 1.35, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
                <b className="block">Suggested description</b>
                A soft 20 in plush bear in warm beige. Hypoallergenic filling, machine washable, and a gift-ready bow.
              </div>
              <div data-ps data-ps-detail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black" style={{ width: cq(210), padding: cq(12), borderRadius: cq(16), boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                <Plush className="block w-full" style={{ height: cq(170), borderRadius: cq(10) }} />
                <p className="font-semibold" style={{ ...t(12), marginTop: cq(8) }}>Plush Bear, 20 in</p>
                <p className="text-black/60" style={{ ...t(9), marginTop: cq(3) }}>A soft plush bear in warm beige. Hypoallergenic and machine washable.</p>
              </div>
              <div data-ps data-ps-row className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 bg-white" style={{ gap: cq(14), padding: cq(18), borderRadius: cq(22), boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} data-ps-tilt={i === 1 ? "" : undefined} className="bg-white text-black" style={{ width: cq(150), borderRadius: cq(10), boxShadow: i === 1 ? "0 12px 30px rgba(0,0,0,0.35)" : "none" }}>
                    <Plush className="block w-full" style={{ height: cq(150), borderRadius: cq(10), filter: `hue-rotate(${i * 50}deg)` }} />
                    <p className="font-semibold" style={{ ...t(10), marginTop: cq(6) }}>Plush Bear</p>
                    <p className="text-black/60" style={{ ...t(9), marginTop: cq(2) }}>$24.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
