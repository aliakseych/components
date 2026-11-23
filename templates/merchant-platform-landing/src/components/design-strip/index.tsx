import { useRef } from "react";
import { ThemeArt } from "@/sample/art";
import { cn } from "@/lib/utils";
import { gsap, useGsap } from "@/lib/motion";

const sides = [
  { role: "outer-left", accent: 0, ratio: 1.546, top: "top-[120px] sm:top-[150px] md:top-[130px] lg:top-[130px]", w: "w-[85px] sm:w-[150px] md:w-[180px] lg:w-[300px]", cropped: true, z: "z-0" },
  { role: "inner-left", accent: 3, ratio: 1.268, top: "top-[100px] lg:top-[90px]", w: "w-[110px] sm:w-[180px] lg:w-[320px]", cropped: false, z: "z-10" },
  { role: "inner-right", accent: 1, ratio: 1.268, top: "top-[100px] lg:top-[90px]", w: "w-[110px] sm:w-[180px] lg:w-[320px]", cropped: false, z: "z-10" },
  { role: "outer-right", accent: 2, ratio: 1.546, top: "top-[120px] sm:top-[150px] md:top-[130px] lg:top-[130px]", w: "w-[85px] sm:w-[150px] md:w-[180px] lg:w-[300px]", cropped: true, z: "z-0" },
] as const;

const offsets = {
  base: { inner: 95, outer: 165 },
  sm: { inner: 140, outer: 290 },
  md: { inner: 160, outer: 300 },
  lg: { inner: 230, outer: 460 },
};

function offsetFor(role: string, width: number) {
  const { inner, outer } = offsets[width >= 1024 ? "lg" : width >= 768 ? "md" : width >= 640 ? "sm" : "base"];
  return role === "outer-left" ? -outer : role === "inner-left" ? -inner : role === "inner-right" ? inner : outer;
}

export type DesignStripProps = { title: string; sub: string; className?: string };

/** Centered storefront with four more fanning out from behind it as you scroll (scrubbed, scale + fade + spread). */
export function DesignStrip({ title, sub }: DesignStripProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    gsap.from("[data-step-heading]", { y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-step-heading]", start: "top 82%", once: true } });
    const strip = ref.current?.querySelector("[data-theme-strip]");
    if (!strip) return;
    gsap.set("[data-theme-side]", { xPercent: -50 });
    const width = window.innerWidth;
    gsap
      .timeline({ scrollTrigger: { trigger: strip, start: "top 85%", end: "center 35%", scrub: 1 } })
      .fromTo(
        "[data-theme-side]",
        { x: 0, scale: 0.4, autoAlpha: 0 },
        { x: (_i: number, el: HTMLElement) => offsetFor(el.dataset.role ?? "", width), scale: 1, autoAlpha: 1, ease: "power2.out", stagger: 0.06 },
        0,
      )
      .fromTo("[data-theme-center]", { scale: 0.68 }, { scale: 1, ease: "power2.out" }, 0);
  });

  return (
    <div ref={ref}>
      <div data-step-heading className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-[34px] leading-tight tracking-[-0.68px] text-white sm:text-[44px] sm:leading-[48.4px] sm:tracking-[-0.88px]">{title}</h2>
        <p className="pt-3 text-lg leading-7 font-light text-white/70">{sub}</p>
      </div>
      <div data-theme-strip className="relative mx-auto flex min-h-[360px] w-full max-w-[1440px] items-start justify-center py-14 pb-28 sm:min-h-[430px] lg:min-h-[480px]">
        {sides.map((s) => (
          <div
            key={s.role}
            data-theme-side
            data-role={s.role}
            className={cn("absolute left-1/2 overflow-hidden rounded-lg bg-white shadow-xl", s.top, s.w, s.z)}
            style={s.cropped ? { aspectRatio: "300 / 284" } : undefined}
          >
            <ThemeArt accent={s.accent} ratio={s.ratio} className={s.cropped ? "block h-full w-full object-cover" : "block w-full"} />
          </div>
        ))}
        <div data-theme-center className="relative z-20 w-[180px] overflow-hidden rounded-xl bg-white shadow-2xl sm:w-[240px] lg:w-[372px]">
          <ThemeArt accent={4} ratio={1.17} className="block w-full" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>
    </div>
  );
}
