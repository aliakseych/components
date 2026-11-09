"use client";

// Shared motion presets. CSS mirrors these as --ease-out / --dur-* in index.css.
import { useCallback, useEffect, useRef, useState } from "react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.12, base: 0.22, slow: 0.6 } as const;

/**
 * Screen enter: a cross-fade. No transform on purpose: a transformed wrapper becomes the
 * containing block of position: fixed bars (invest button, chat composer) and they jump.
 * Direction is kept for callers; content inside still rises with the .rise/.stagger utilities.
 */
export const screenEnter = (_direction: 1 | -1) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DUR.base, ease: EASE_OUT },
});

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Counts from 0 to value once per mount (~600ms, ease-out). Later changes jump. */
export function useCountUp(value: number, duration = DUR.slow * 1000) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const done = useRef(false);
  useEffect(() => {
    if (done.current || prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
      else done.current = true;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return shown;
}

/** Sets data-edge-start / data-edge-end on a scroller while more content lies that way. Pair with edge-fade-x / edge-fade-y. */
export function attachScrollEdges(el: HTMLElement) {
  const update = () => {
    const vertical = el.scrollHeight - el.clientHeight > el.scrollWidth - el.clientWidth;
    const pos = vertical ? el.scrollTop : Math.abs(el.scrollLeft);
    const max = vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    el.toggleAttribute("data-edge-start", pos > 2);
    el.toggleAttribute("data-edge-end", max - pos > 2);
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  const resize = new ResizeObserver(update);
  resize.observe(el);
  for (const child of Array.from(el.children)) resize.observe(child);
  const mutation = new MutationObserver(update);
  mutation.observe(el, { childList: true, subtree: true });
  return () => {
    el.removeEventListener("scroll", update);
    resize.disconnect();
    mutation.disconnect();
  };
}

export function useScrollEdges<T extends HTMLElement = HTMLDivElement>() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = el ? attachScrollEdges(el) : null;
  }, []);
}
