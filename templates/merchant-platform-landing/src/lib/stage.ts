import { useEffect, type RefObject } from "react";
import type gsap from "gsap";

/** Converts a pixel size authored against the 1260px-wide reference video to container-relative units, so the demo scales with its stage. */
export const cq = (n: number) => `${+(n / 12.6).toFixed(3)}cqw`;

/** Plays a paused timeline only while its stage is on screen (the reference pauses its videos off screen). */
export function usePlayWhenVisible(stage: RefObject<Element | null>, build: () => gsap.core.Timeline | null) {
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const tl = build();
    if (!tl) return;
    tl.pause(0);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.1 });
    io.observe(el);
    return () => {
      io.disconnect();
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
