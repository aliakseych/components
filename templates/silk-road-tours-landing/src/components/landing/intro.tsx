// Sunrise intro: the sun disc rises, its rays grow, the wordmark wipes in, the lockup flies (FLIP) into the nav mark
// (`[data-brand-target]`), then the adras is pulled up like a curtain. Any key, click, wheel or touch skips it.
// Reduced motion: a 200ms fade, nothing moves.
import { useLayoutEffect, useRef, useState } from "react";
import adras from "@/assets/textures/adras-hero.webp";
import { SunMark } from "./sun-mark";

const OUT = "cubic-bezier(.22,1,.36,1)";
const INOUT = "cubic-bezier(.6,0,.2,1)";
const RUNNING = "intro-running";

export function Intro({ brandName }: { brandName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);

  useLayoutEffect(() => {
    const overlay = ref.current;
    if (!overlay || !overlay.animate) return setOn(false);
    const root = document.documentElement;
    const $ = <T extends Element>(sel: string) => overlay.querySelector<T>(sel)!;
    let done = false;
    const anims: Animation[] = [];
    const end = () => {
      done = true;
      root.classList.remove(RUNNING);
      setOn(false);
    };
    const fadeOut = (duration: number, delay = 0) => {
      const a = overlay.animate({ opacity: [1, 0] }, { duration, delay, fill: "forwards" });
      a.finished.then(end, () => {});
    };
    const play = (el: Element, kf: Keyframe[] | PropertyIndexedKeyframes, delay: number, duration: number, easing = "linear") => {
      const a = el.animate(kf, { delay, duration, easing, fill: "backwards" });
      anims.push(a);
      return a;
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fadeOut(200, 250);
      return () => root.classList.remove(RUNNING);
    }
    root.classList.add(RUNNING);
    const skip = () => {
      if (done) return;
      done = true;
      root.classList.remove(RUNNING);
      fadeOut(160);
    };
    const events = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
    for (const type of events) addEventListener(type, skip, { once: true, passive: true });

    const stage = $<HTMLElement>(".intro-stage");
    const sun = $<SVGElement>(".sun-mark-sun");
    const word = $<HTMLElement>(".sun-mark-word");
    const cover = $<HTMLElement>(".intro-cover");
    // Stage starts with the sun centred on screen at 1.5x.
    const sunBox = sun.getBoundingClientRect(), stageBox = stage.getBoundingClientRect();
    const shift = stageBox.left + stageBox.width / 2 - (sunBox.left + sunBox.width / 2);
    const origin = `${sunBox.left + sunBox.width / 2 - stageBox.left}px 50%`;
    stage.style.transformOrigin = origin;

    // 0–0.45s: the disc rises from below the bottom edge.
    play($(".sun-mark-disc"), { transform: [`translateY(${innerHeight}px)`, "none"] }, 0, 450, OUT);
    // 0.45–1.1s: rays grow clockwise.
    overlay.querySelectorAll(".sun-mark-ray").forEach((ray, i) => {
      play(ray, { transform: ["scale(.4)", "none"], opacity: [0, 1] }, 450 + i * 40, 260, "cubic-bezier(.3,1.35,.6,1)");
    });
    // 1.3–1.72s: the sun slides left and the wordmark wipes in from under its cover.
    play(word, { opacity: [0, 0] }, 0, 1300);
    play(cover, { opacity: [1, 1], transform: ["none", "translateX(101%)"] }, 1300, 420, INOUT);
    play(stage, { transform: [`translateX(${shift}px) scale(1.5)`, "none"] }, 1300, 420, INOUT).finished.then(() => {
      if (done) return;
      // 1.72–2.1s: FLIP into the nav mark; fade in place when there is no visible target.
      const target = document.querySelector("[data-brand-target] .sun-mark");
      const to = target?.getBoundingClientRect();
      const from = stage.getBoundingClientRect();
      if (!to || !to.height || to.bottom < 0 || to.top > innerHeight) return fadeOut(300);
      const options: KeyframeAnimationOptions = { duration: 400, easing: INOUT, fill: "forwards" };
      stage.style.transformOrigin = "0 50%";
      stage.animate({ transform: `translate(${to.x - from.x}px,${to.y + to.height / 2 - from.y - from.height / 2}px) scale(${to.height / from.height})` }, options);
      const curtain = $<HTMLElement>(".intro-adras");
      curtain
        .animate({ opacity: [0, 1] }, { duration: 220, easing: "ease-out", fill: "forwards" })
        .finished.then(() => {
          overlay.style.background = "transparent";
          root.classList.remove(RUNNING);
          return curtain.animate({ transform: ["none", "translateY(-100%)"] }, { duration: 750, delay: 120, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }).finished;
        })
        .then(() => done || end(), () => {});
    }, () => {});

    return () => {
      for (const type of events) removeEventListener(type, skip);
      anims.forEach((a) => a.cancel());
      root.classList.remove(RUNNING);
    };
  }, []);

  if (!on) return null;
  return (
    <div ref={ref} id="intro" className="intro" aria-hidden="true">
      <div className="intro-adras" style={{ backgroundImage: `url("${adras}")` }} />
      <div className="intro-stage">
        <SunMark name={brandName} />
        <span className="intro-cover" />
      </div>
    </div>
  );
}
