'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Puppet } from './puppet';
import { Puppeteer } from './puppeteer';
import { LIFE_CAMERA, LIFE_DRIFT, LIFE_STATES, LIFE_STEPS } from './life-data';
import type { StoryRun, StoryStageProps } from './story';
import './toast-scene.css';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Index of each step in the story's caption list: the labelled steps, in order. */
const CAPTION_OF_LABEL = new Map(LIFE_STEPS.filter((step) => step.label).map((step, index) => [step.label!, index]));

/** The plateau state each caption shows in the reduced-motion sequence. */
export const TOAST_PLATEAUS = LIFE_STEPS.filter((step) => step.label).map((step) => step.state);

/** The right-hand element: a toast living through every state, scrubbed by the story. */
export function ToastStage({ onRun }: StoryStageProps) {
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const puppet = useRef<HTMLDivElement>(null);
  const cloud = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stageEl = stage.current;
    const cameraEl = camera.current;
    const cloudEl = cloud.current;
    if (!stageEl || !cameraEl || !cloudEl || !puppet.current) return;
    const puppeteer = new Puppeteer(puppet.current, LIFE_STATES);
    const script = puppeteer.script(LIFE_STEPS);

    // Each hold shows the caption of its label; unlabeled holds keep the previous one.
    let step = 0;
    const holds = script.holds.map((hold) => {
      const found = hold.label ? CAPTION_OF_LABEL.get(hold.label) : undefined;
      if (found !== undefined) step = found;
      return { step, start: hold.start, end: hold.end, state: hold.state };
    });

    let view = { desktop: true, width: 0, height: 0 };
    const remeasure = () => {
      puppeteer.measure();
      view = { desktop: window.innerWidth >= LIFE_CAMERA.minWidth, width: stageEl.clientWidth, height: stageEl.clientHeight };
    };
    remeasure();

    /** Camera per state: scale and the shell height it frames (centred in the stage). */
    const shot = (state: number) => {
      const pose = puppeteer.pose(state);
      if (!view.desktop) return { scale: 1, h: pose.h };
      const fit = Math.min(LIFE_CAMERA.island, (view.width * 0.94) / Math.max(1, puppeteer.pose(4).w));
      return { scale: pose.mode === 'pill' ? fit * (LIFE_CAMERA.pill / LIFE_CAMERA.island) : fit, h: pose.h };
    };

    /** Where t falls: inside hold k, or moving from hold k to k + 1. */
    const locate = (t: number) => {
      for (let index = 0; index < holds.length; index += 1) {
        const hold = holds[index]!;
        if (t <= hold.end) {
          if (t >= hold.start || index === 0) return { from: index, to: index, p: 1 };
          const previous = holds[index - 1]!;
          return { from: index - 1, to: index, p: (t - previous.end) / (hold.start - previous.end) };
        }
      }
      return { from: holds.length - 1, to: holds.length - 1, p: 1 };
    };

    const render = (t: number) => {
      script.render(Math.min(t, script.duration));
      const at = locate(Math.min(t, script.duration));
      const a = shot(holds[at.from]!.state);
      const b = shot(holds[at.to]!.state);
      const k = smooth(at.p);
      const scale = lerp(a.scale, b.scale, k);
      const h = lerp(a.h, b.h, k);

      // Finale: the stack rises, softens and hands over to a cloud.
      const drift = clamp01((t - script.duration) / LIFE_DRIFT);
      const rise = smooth(drift);
      const lift = -rise * view.height * 0.42;
      gsap.set(cameraEl, {
        y: -(h * scale) / 2 + lift,
        scale: scale * (1 - 0.12 * rise),
        opacity: 1 - smooth(drift / 0.55),
        filter: drift > 0 ? `blur(${(12 * smooth(drift / 0.7)).toFixed(2)}px)` : 'none',
      });
      const cloudIn = smooth((drift - 0.1) / 0.35);
      const cloudOut = smooth((drift - 0.6) / 0.4);
      gsap.set(cloudEl, {
        y: lift * 1.25 - view.height * 0.04,
        scale: lerp(0.55, 1.15, rise),
        opacity: cloudIn * (1 - cloudOut),
      });
      // The last caption leaves with the cloud.
      return smooth((drift - 0.6) / 0.4);
    };

    const run: StoryRun = {
      duration: script.duration,
      total: script.duration + LIFE_DRIFT,
      holds,
      labels: [...script.labels.values()],
      render,
      remeasure,
    };
    onRun(run);
    return () => onRun(null);
  }, [onRun]);

  return (
    <div ref={stage} className="toast-stage">
      <div ref={cloud} className="toast-cloud" />
      <div ref={camera} className="toast-camera">
        <Puppet ref={puppet} states={LIFE_STATES} />
      </div>
    </div>
  );
}

/** Reduced motion: one still toast, resting in `state`. */
export function ToastStill({ state }: { state: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = LIFE_STATES[state]!;
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const puppeteer = new Puppeteer(root, [shown]);
    const draw = () => {
      puppeteer.measure();
      puppeteer.set(0, 0.5);
      root.style.height = `${puppeteer.height}px`;
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(root.parentElement ?? root);
    return () => observer.disconnect();
  }, [shown]);
  return (
    <div className="toast-still">
      <Puppet ref={ref} states={[shown]} />
    </div>
  );
}
