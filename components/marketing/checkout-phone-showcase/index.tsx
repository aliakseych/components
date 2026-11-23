"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Garment, type GarmentKind } from "./art";
import { SCENE_CSS } from "./styles";

export type { GarmentKind } from "./art";

export type CheckoutPhoneProduct = {
  name: string;
  rating: string;
  price: string;
  /** Built-in drawing used when `image` is not set. */
  art?: GarmentKind;
  /** Custom product image; it fills a 204x293 tile. */
  image?: ReactNode;
};

export type CheckoutPhoneColors = {
  /** Stage behind the scene */
  stage?: string;
  /** Light panel behind the product row */
  paper?: string;
  /** Product tile and thumbnail background */
  tile?: string;
  /** Add to cart button */
  accent?: string;
  /** Pay now button */
  ink?: string;
  /** Blue light behind the phone */
  glow?: string;
  /** Star rating */
  star?: string;
};

export type CheckoutPhoneShowcaseProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: string;
  description?: string;
  /** Exactly four products; the last one is added to the cart. */
  products?: [CheckoutPhoneProduct, CheckoutPhoneProduct, CheckoutPhoneProduct, CheckoutPhoneProduct];
  addLabel?: string;
  payLabel?: string;
  /** Second line under the product name on the checkout card. */
  category?: string;
  /** Lock-screen date line and big clock. */
  lockDate?: string;
  lockTime?: string;
  notification?: { app: string; time: string; message: string };
  colors?: CheckoutPhoneColors;
};

const DEFAULT_PRODUCTS: NonNullable<CheckoutPhoneShowcaseProps["products"]> = [
  { name: "Crew Tee with Tape Trim", rating: "4.5/5", price: "$120", art: "tee" },
  { name: "Plaid Flannel Shirt", rating: "4.5/5", price: "$180", art: "plaid" },
  { name: "Raglan Striped Tee", rating: "4.5/5", price: "$130", art: "raglan" },
  { name: "Slim Straight Denim Jeans", rating: "3.5/5", price: "$240", art: "jeans" },
];

const GARMENT_VARS: Record<string, string> = {
  "--cps-garment-1": "oklch(0.24 0.005 270)",
  "--cps-garment-2": "oklch(0.38 0.1 280)",
  "--cps-garment-2b": "oklch(0.55 0.2 20)",
  "--cps-garment-3": "oklch(0.68 0.19 45)",
  "--cps-garment-3b": "oklch(0.55 0.2 40)",
  "--cps-garment-4": "oklch(0.45 0.08 250)",
  "--cps-garment-4b": "oklch(0.36 0.07 250)",
  "--cps-wall-a": "oklch(0.9 0.05 200)",
  "--cps-wall-b": "oklch(0.5 0.2 275)",
  "--cps-wall-c": "oklch(0.72 0.12 235)",
  "--cps-wall-d": "oklch(0.86 0.08 170)",
};

function Stars({ rating, className }: { rating: string; className?: string }) {
  const value = parseFloat(rating) || 0;
  return (
    <div className={cn("flex items-center gap-[3px]", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
          <path
            d="M6 .8l1.5 3.3 3.5.4-2.6 2.4.7 3.5L6 8.6 2.9 10.4l.7-3.5L1 4.5l3.5-.4z"
            fill="var(--cps-star)"
            opacity={value >= i + 1 ? 1 : value > i ? 0.55 : 0.25}
          />
        </svg>
      ))}
      <span className="ml-1 text-[10px] leading-none text-[color-mix(in_oklab,var(--cps-ink)_55%,transparent)]">{rating}</span>
    </div>
  );
}

function Art({ product }: { product: CheckoutPhoneProduct }) {
  return <>{product.image ?? <Garment kind={product.art ?? "tee"} />}</>;
}

/** Product grid, add-to-cart, pay and phone notification loop. Loop pauses off screen. */
export function CheckoutPhoneShowcase({
  title = "Accepting payment is easy",
  description = "All you need is a bank account.",
  products = DEFAULT_PRODUCTS,
  addLabel = "Add to cart",
  payLabel = "Pay now",
  category = "Clothes / Jeans",
  lockDate = "Apr 1 · SFO",
  lockTime = "9:41",
  notification = { app: "Shop", time: "now", message: "Alexander Morgan, You've made a sale!" },
  colors,
  className,
  style,
  ...rest
}: CheckoutPhoneShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const featured = products[3];

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;
    const fit = () => stage.style.setProperty("--cps-s", String(stage.clientWidth / 1260));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!root || !scene || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(stage, {
        y: 120,
        autoAlpha: 0,
        duration: 1.3,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 72%", once: true },
      });
      gsap.to(stage, {
        y: -40,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
      });
      ScrollTrigger.create({
        trigger: root,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => scene.setAttribute("data-state", "playing"),
        onEnterBack: () => scene.setAttribute("data-state", "playing"),
        onLeave: () => scene.setAttribute("data-state", "paused"),
        onLeaveBack: () => scene.setAttribute("data-state", "paused"),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const vars = {
    "--cps-stage": colors?.stage ?? "black",
    "--cps-paper": colors?.paper ?? "oklch(0.93 0 0)",
    "--cps-tile": colors?.tile ?? "oklch(0.97 0.003 90)",
    "--cps-accent": colors?.accent ?? "oklch(0.52 0.24 262)",
    "--cps-ink": colors?.ink ?? "oklch(0.15 0.02 230)",
    "--cps-glow": colors?.glow ?? "oklch(0.55 0.25 262)",
    "--cps-star": colors?.star ?? "oklch(0.82 0.17 85)",
    ...GARMENT_VARS,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      {...rest}
      className={cn("py-16 text-white", className)}
      style={{ ...vars, backgroundColor: "var(--cps-stage)" }}
    >
      <style>{SCENE_CSS}</style>
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-[34px] leading-tight tracking-[-0.68px] sm:text-[44px] sm:leading-[48.4px] sm:tracking-[-0.88px]">{title}</h2>
        <p className="pt-3 text-lg leading-7 font-light text-white/70">{description}</p>
      </div>
      <div className="mx-auto mt-12 w-full max-w-[1200px] px-6">
        <div
          ref={stageRef}
          role="img"
          aria-label={`${title}: a customer adds a product to the cart, pays, and the seller gets a sale notification on their phone.`}
          className="relative mx-auto w-full overflow-hidden"
          style={{ aspectRatio: "1260 / 504" }}
        >
          <div ref={sceneRef} data-state="paused" className="cps-scene absolute top-0 left-0 origin-top-left" style={{ transform: "scale(var(--cps-s, 1))" }} aria-hidden>
            <div className="cps-glow" />
            <div className="cps-grid">
              <div className="cps-wrap">
                <div className="cps-paper" />
                {products.map((p, i) => (
                  <div key={p.name} className={`cps-item-${i} absolute`} style={{ left: 59 + 217 * i, top: 47, width: 204 }}>
                    <div className="h-[293px] w-[204px] overflow-hidden rounded-xl p-6" style={{ background: "var(--cps-tile)" }}>
                      <Art product={p} />
                    </div>
                    <p className="pt-2 text-[13px] leading-4 text-[var(--cps-ink)]">{p.name}</p>
                    <Stars rating={p.rating} className="pt-1" />
                    <p className="pt-1 text-xs leading-4 font-semibold text-[var(--cps-ink)]">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="cps-card rounded-2xl bg-white p-[9px] text-[var(--cps-ink)] shadow-2xl">
              <div className="h-[281px] w-[239px] overflow-hidden rounded-lg p-6" style={{ background: "var(--cps-tile)" }}>
                <Art product={featured} />
              </div>
              <p className="pt-2 text-[17px] leading-6">{featured.name}</p>
              <Stars rating={featured.rating} className="pt-0.5" />
              <p className="pt-1 text-sm leading-5 font-semibold">{featured.price}</p>
              <div className="absolute inset-x-[9px] bottom-[11px] flex h-[38px] items-center justify-center rounded-lg text-[15px] font-medium text-white" style={{ background: "var(--cps-accent)" }}>
                {addLabel}
              </div>
            </div>

            <div className="cps-checkout rounded-2xl bg-white text-[var(--cps-ink)] shadow-2xl">
              <div className="cps-co-text absolute top-[34px] left-[108px] right-5">
                <p className="text-[13px] leading-4 font-medium">{featured.name}</p>
                <p className="pt-1 text-[11px] leading-4 text-[color-mix(in_oklab,var(--cps-ink)_50%,transparent)]">{category}</p>
                <p className="absolute top-3 right-0 text-xs text-[color-mix(in_oklab,var(--cps-ink)_25%,transparent)]">{featured.price}</p>
              </div>
              <div className="absolute top-[162px] left-[37px] flex h-[43px] w-[279px] items-center justify-center rounded-lg text-[15px] font-medium text-white" style={{ background: "var(--cps-ink)" }}>
                {payLabel}
              </div>
            </div>

            <div className="cps-thumb">
              <div className="h-full w-full overflow-hidden rounded-md p-2 shadow-md" style={{ background: "var(--cps-tile)" }}>
                <Art product={featured} />
              </div>
              <span className="absolute -top-2 -right-2 flex size-[18px] items-center justify-center rounded-full bg-[oklch(0.4_0.09_245)] text-[10px] leading-none font-medium text-white">1</span>
            </div>

            <div className="cps-phone-slot">
              <div className="cps-phone">
                <div className="h-full w-full rounded-[56px] p-[4px] shadow-2xl" style={{ background: "linear-gradient(145deg, oklch(0.9 0.005 250), oklch(0.62 0.01 250) 45%, oklch(0.85 0.005 250))" }}>
                  <div className="relative h-full w-full rounded-[52px] bg-black p-[7px]">
                    <div
                      className="relative h-full w-full overflow-hidden rounded-[45px] text-white"
                      style={{
                        background:
                          "radial-gradient(110% 55% at 15% 6%, var(--cps-wall-a), transparent 62%), radial-gradient(80% 60% at 92% 42%, var(--cps-wall-b), transparent 68%), linear-gradient(180deg, var(--cps-wall-a) 0%, var(--cps-wall-c) 52%, var(--cps-wall-d) 100%)",
                      }}
                    >
                      <div className="absolute top-[13px] left-1/2 h-[27px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
                      <p className="absolute top-[78px] inset-x-0 text-center text-[17px] font-medium tracking-tight text-white/80">{lockDate}</p>
                      <p className="absolute top-[92px] inset-x-0 text-center text-[104px] leading-[1.05] font-semibold tracking-[-4px] text-white/75">{lockTime}</p>
                      <div className="absolute top-[205px] left-[24px] h-[7px] w-[70px] rounded-full bg-white/30" />
                      <div className="absolute top-[222px] left-[24px] h-[7px] w-[48px] rounded-full bg-white/20" />
                      <div className="absolute top-[190px] left-[190px] flex size-[48px] items-center justify-center rounded-full border-2 border-white/60 bg-white/15 text-[15px] font-semibold">67</div>
                      <div className="absolute top-[190px] left-[250px] flex size-[48px] items-center justify-center rounded-full bg-white/20 text-[11px] font-semibold">8:29</div>
                      <div className="cps-notif absolute top-[266px] left-[26px] flex h-[58px] w-[298px] items-center gap-2 rounded-2xl bg-white/80 px-3 text-[var(--cps-ink)] backdrop-blur-md">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md" style={{ background: "var(--cps-ink)" }}>
                          <span className="size-3 rounded-full border-2 border-white" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex justify-between text-[10px] leading-3 font-semibold">
                            <span>{notification.app}</span>
                            <span className="font-normal opacity-50">{notification.time}</span>
                          </span>
                          <span className="block truncate text-[11px] leading-4">{notification.message}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
