import { useRef } from "react";
import { gsap, prefersReducedMotion, useGsap } from "@/lib/motion";
import { cq, usePlayWhenVisible } from "@/lib/stage";
import { Garment, Stars } from "./garments";

const goods = [
  { kind: "tee", name: "T-shirts with Tape Details", price: "$120" },
  { kind: "plaid", name: "Checkered Shirt", price: "$180" },
  { kind: "raglan", name: "Sleeve Striped T-shirt", price: "$130" },
  { kind: "jeans", name: "Slim Fit Jeans", price: "$240" },
] as const;

const t = (n: number) => ({ fontSize: cq(n) });

function ProductCard({ kind, name, price }: (typeof goods)[number]) {
  return (
    <div data-card className="shrink-0" style={{ width: cq(200) }}>
      <Garment kind={kind} className="block w-full" style={{ height: cq(290) }} preserveAspectRatio="xMidYMid slice" />
      <p className="font-semibold text-black" style={{ ...t(11), marginTop: cq(9) }} data-caption>{name}</p>
      <div className="flex items-center" style={{ gap: cq(6), marginTop: cq(5) }} data-caption>
        <Stars style={{ width: cq(48) }} className="block" />
        <span className="text-black/60" style={t(9)}>4.5/5</span>
      </div>
      <p className="font-semibold text-black" style={{ ...t(11), marginTop: cq(4) }} data-caption>{price}</p>
    </div>
  );
}

function Phone() {
  return (
    <div data-phone-device className="absolute left-1/2 -translate-x-1/2" style={{ top: cq(160), width: cq(340), height: cq(700) }}>
      <div className="relative size-full overflow-hidden bg-[#c8ced6]" style={{ borderRadius: cq(58), padding: cq(7), boxShadow: `0 0 0 ${cq(2)} #8d96a3` }}>
        <div className="relative size-full overflow-hidden" style={{ borderRadius: cq(51), background: "radial-gradient(120% 70% at 20% 90%, #1f45c4 0%, transparent 60%), radial-gradient(90% 60% at 90% 55%, #4da3ff 0%, transparent 60%), linear-gradient(160deg, #cdeee4 0%, #8fd3c2 38%, #3a6bd6 80%)" }}>
          <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black" style={{ top: cq(14), width: cq(104), height: cq(30) }} />
          <p className="absolute w-full text-center font-medium text-white/80" style={{ top: cq(62), ...t(14) }}>Fri 1 · 9:41 AM</p>
          <p className="absolute w-full text-center font-semibold tracking-tight text-white/85" style={{ top: cq(78), ...t(112), lineHeight: 1 }}>9:41</p>
          <div className="absolute flex w-full justify-center" style={{ top: cq(214), gap: cq(14) }}>
            {[0, 1, 2].map((i) => <span key={i} className="rounded-full bg-black/30" style={{ width: cq(52), height: cq(52) }} />)}
          </div>
          <div data-notification className="absolute flex items-center bg-white/60 backdrop-blur-md" style={{ top: cq(298), left: cq(14), right: cq(14), borderRadius: cq(22), padding: cq(12), gap: cq(10) }}>
            <span className="grid shrink-0 place-items-center bg-[#14507f]" style={{ width: cq(36), height: cq(36), borderRadius: cq(9) }}>
              <span className="rounded-full bg-white" style={{ width: cq(14), height: cq(14) }} />
            </span>
            <span className="min-w-0 leading-tight text-black" style={t(12)}>
              <b className="block">Marlo</b>
              <span className="block text-black/80">New order paid · $240.00</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type AcceptingPaymentProps = { title: string; sub: string };

/** "Accepting payment is easy": catalog → add to cart → pay → payment notification on a phone. A looping 8s timeline that plays only on screen and rests on the final frame under reduced motion. */
export function AcceptingPayment({ title, sub }: AcceptingPaymentProps) {
  const block = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGsap(block, () => {
    gsap.from("[data-phone]", { y: 120, autoAlpha: 0, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: block.current, start: "top 72%", once: true } });
    gsap.to("[data-phone]", { y: -40, ease: "none", scrollTrigger: { trigger: block.current, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("[data-step-heading]", { y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-step-heading]", start: "top 82%", once: true } });
  });

  usePlayWhenVisible(stage, () => {
    if (prefersReducedMotion()) {
      gsap.set("[data-panel], [data-focus], [data-checkout]", { autoAlpha: 0 });
      return null;
    }
    const q = gsap.utils.selector(stage);
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });
    tl.set(q("[data-panel]"), { autoAlpha: 1, scale: 0.82, y: 56 }, 0)
      .set(q("[data-dim]"), { opacity: 0.5 }, 0)
      .set(q("[data-card]"), { y: (i: number) => 80 + i * 70 }, 0)
      .set(q("[data-caption]"), { autoAlpha: 0 }, 0)
      .set(q("[data-focus], [data-checkout]"), { autoAlpha: 0 }, 0)
      .set(q("[data-phone-device]"), { y: 560 }, 0)
      .set(q("[data-glow]"), { autoAlpha: 0 }, 0)
      .set(q("[data-notification]"), { autoAlpha: 0, y: -24 }, 0)
      .set(q("[data-stage-fade]"), { autoAlpha: 1 }, 0)
      .to(q("[data-card]"), { y: 0, duration: 0.8, stagger: 0.12 }, 0.5)
      .to(q("[data-panel]"), { scale: 1, y: 0, duration: 0.9 }, 0.9)
      .to(q("[data-dim]"), { opacity: 0, duration: 0.7 }, 1.0)
      .to(q("[data-caption]"), { autoAlpha: 1, duration: 0.4 }, 1.5)
      .to(q("[data-dim]"), { opacity: 0.5, duration: 0.4 }, 2.2)
      .fromTo(q("[data-focus]"), { autoAlpha: 0, scale: 0.88, y: 24 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5 }, 2.3)
      .to(q("[data-focus]"), { autoAlpha: 0, scale: 0.7, duration: 0.4, ease: "power2.in" }, 3.4)
      .to(q("[data-panel]"), { autoAlpha: 0, duration: 0.4 }, 3.4)
      .fromTo(q("[data-checkout]"), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, 3.6)
      .to(q("[data-checkout]"), { y: 36, scale: 0.9, duration: 0.7, ease: "power2.inOut" }, 4.4)
      .to(q("[data-checkout]"), { autoAlpha: 0, duration: 0.4 }, 5.0)
      .to(q("[data-glow]"), { autoAlpha: 1, duration: 0.9 }, 4.9)
      .to(q("[data-phone-device]"), { y: 0, duration: 1, ease: "power3.out" }, 4.9)
      .to(q("[data-notification]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 6.1)
      .to(q("[data-stage-fade]"), { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 7.5);
    return tl;
  });

  return (
    <div ref={block} className="py-16">
      <div data-step-heading className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-[34px] leading-tight tracking-[-0.68px] text-white sm:text-[44px] sm:leading-[48.4px] sm:tracking-[-0.88px]">{title}</h2>
        <p className="pt-3 text-lg leading-7 font-light text-white/70">{sub}</p>
      </div>
      <div className="mx-auto mt-12 w-full px-6">
        <div data-phone ref={stage} role="img" aria-label="Animation: a shopper picks a product, pays, and the merchant's phone shows the payment notification" className="relative aspect-[1260/504] w-full overflow-hidden bg-black" style={{ containerType: "inline-size" }}>
          <div data-stage-fade className="absolute inset-0">
            <div data-glow aria-hidden className="absolute inset-x-0 bottom-0" style={{ height: cq(280), background: "radial-gradient(60% 70% at 50% 100%, rgba(32,120,255,0.55) 0%, rgba(20,80,200,0.2) 45%, transparent 75%)", filter: `blur(${cq(18)})` }} />
            <div data-panel className="absolute overflow-hidden bg-[#e6e6e6]" style={{ left: cq(143), top: cq(32), width: cq(974), height: cq(437), borderRadius: cq(56) }}>
              <div className="flex" style={{ gap: cq(16), padding: `${cq(48)} 0 0 ${cq(62)}` }}>
                {goods.map((g) => <ProductCard key={g.name} {...g} />)}
              </div>
              <div data-dim className="absolute inset-0 bg-black" />
            </div>
            <div data-focus className="absolute left-1/2 -translate-x-1/2 bg-white" style={{ top: cq(18), width: cq(254), height: cq(426), borderRadius: cq(18), padding: cq(14), boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <Garment kind="jeans" className="block w-full" style={{ height: cq(290), borderRadius: cq(10) }} preserveAspectRatio="xMidYMid slice" />
              <p className="font-semibold text-black" style={{ ...t(13), marginTop: cq(10) }}>Slim Fit Jeans</p>
              <Stars style={{ width: cq(56), marginTop: cq(6) }} className="block" />
              <p className="font-semibold text-black" style={{ ...t(13), marginTop: cq(6) }}>$240</p>
              <span className="grid w-full place-items-center bg-[#0052ff] font-medium text-white" style={{ ...t(13), height: cq(34), borderRadius: cq(6), marginTop: cq(10) }}>Add to cart</span>
            </div>
            <div data-checkout className="absolute left-1/2 -translate-x-1/2 bg-white" style={{ top: cq(120), width: cq(347), height: cq(224), borderRadius: cq(14), padding: cq(18), boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center" style={{ gap: cq(12) }}>
                <span className="relative block shrink-0" style={{ width: cq(52), height: cq(64) }}>
                  <Garment kind="jeans" className="block size-full" style={{ borderRadius: cq(6) }} preserveAspectRatio="xMidYMid slice" />
                  <span className="absolute grid place-items-center rounded-full bg-[#0052ff] text-white" style={{ top: cq(-6), right: cq(-6), width: cq(18), height: cq(18), ...t(10) }}>1</span>
                </span>
                <span className="leading-tight text-black" style={t(13)}>
                  <b className="block">Slim Fit Jeans</b>
                  <span className="block text-black/50">Clothes / Jeans</span>
                </span>
                <span className="ml-auto self-start text-black/40" style={t(12)}>$240</span>
              </div>
              <span className="grid w-full place-items-center bg-[#0b1220] font-medium text-white" style={{ ...t(14), height: cq(42), borderRadius: cq(8), marginTop: cq(52) }}>Pay now</span>
            </div>
            <Phone />
          </div>
        </div>
      </div>
    </div>
  );
}
