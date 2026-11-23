import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fade and rise into place once the trigger reaches 78% of the viewport (the reference's default reveal). */
export function revealUp(targets: gsap.TweenTarget, trigger: Element | null | undefined, vars: gsap.TweenVars = {}) {
  return gsap.from(targets, {
    y: 48,
    autoAlpha: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: { trigger: trigger ?? undefined, start: "top 78%", once: true },
    ...vars,
  });
}

/** Runs `setup` inside a scoped gsap context and reverts it on unmount. Skipped entirely under reduced motion so content stays static and visible. */
export function useGsap(scope: RefObject<Element | null>, setup: (reduced: false) => void) {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => setup(false), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
