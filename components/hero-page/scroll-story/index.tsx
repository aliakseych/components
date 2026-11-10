'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import './scroll-story.css';

gsap.registerPlugin(ScrollTrigger);

export type StoryStep = { id: string; title: string; text: string };

/** A stretch of timeline where `step`'s caption is on screen. */
export type StoryHold = { step: number; start: number; end: number };

/** What a scene hands back once its DOM is measured: a pure timeline the story scrubs. */
export type StoryRun = {
  /** Timeline length of the scene's own script. */
  duration: number;
  /** Timeline length including any finale after the script (default: `duration`). */
  total?: number;
  /** Where each caption holds. Captions blur-swap in the gaps between holds with different steps. */
  holds: readonly StoryHold[];
  /** Snap points: the scroll rests on these timeline times. */
  labels: readonly number[];
  /** Draws the scene at timeline time `t`; returns how far the last caption has left (0..1) in a finale. */
  render: (t: number) => number | void;
  /** Re-reads layout after a resize. */
  remeasure: () => void;
};

export type StoryStageProps = {
  /** Pinned scene: report the measured run (and `null` on unmount). */
  onRun: (run: StoryRun | null) => void;
};

export type ScrollStoryProps = {
  title: ReactNode;
  lead?: ReactNode;
  /** The vertical sequence on the left, one caption per step. */
  steps: readonly StoryStep[];
  /** The pinned right-hand element. It animates imperatively through `onRun`. */
  stage: (props: StoryStageProps) => ReactNode;
  /** Reduced-motion layout: the static right-hand element for step `index`. */
  still: (index: number) => ReactNode;
  /** Pinned scroll length in viewport heights. */
  pinScreens?: number;
  /** Scroll smoothing of the scrubbed timeline, seconds. */
  scrub?: number;
  /** `reduced` forces the static sequence; `auto` follows `prefers-reduced-motion`. */
  motion?: 'auto' | 'reduced';
  className?: string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function useReducedMotion(force: boolean) {
  const [reduced, setReduced] = useState(force);
  useEffect(() => {
    if (force) return setReduced(true);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [force]);
  return reduced;
}

/**
 * A pinned scroll story: the section pins, a scrubbed timeline drives the right-hand element and
 * the left-hand captions blur-swap between steps. Reduced motion drops the pin and shows every step
 * as a static row.
 */
export function ScrollStory({ title, lead, steps, stage, still, pinScreens = 9, scrub = 0.6, motion = 'auto', className }: ScrollStoryProps) {
  const reduced = useReducedMotion(motion === 'reduced');
  return (
    <section aria-labelledby="story-title" className={cn('story relative', className)}>
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
        <h2 id="story-title" className="text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
          {title}
        </h2>
        {lead ? <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">{lead}</p> : null}
      </div>
      {reduced ? (
        <ol className="story-sequence mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          {steps.map((step, index) => (
            <li key={step.id} className="story-sequence-row">
              <div className="story-caption-static">
                <span className="story-step">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <div className="story-still">{still(index)}</div>
            </li>
          ))}
        </ol>
      ) : (
        <PinnedStory steps={steps} stage={stage} pinScreens={pinScreens} scrub={scrub} />
      )}
    </section>
  );
}

function PinnedStory({ steps, stage, pinScreens, scrub }: Pick<ScrollStoryProps, 'steps' | 'stage'> & { pinScreens: number; scrub: number }) {
  const pin = useRef<HTMLDivElement>(null);
  const captions = useRef<HTMLOListElement>(null);
  const [run, setRun] = useState<StoryRun | null>(null);

  useEffect(() => {
    const pinEl = pin.current;
    const list = captions.current;
    if (!run || !pinEl || !list) return;
    const captionEls = [...list.children] as HTMLElement[];
    const total = run.total ?? run.duration;
    const { holds } = run;

    /** Where t falls: inside hold k, or moving from hold k to k + 1 (p = how far). */
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
      const leave = smooth(run.render(t) ?? 0);
      const at = locate(Math.min(t, run.duration));
      const fromStep = holds[at.from]!.step;
      const toStep = holds[at.to]!.step;
      // Opacity only, never visibility: every caption stays in the accessibility tree, in order.
      const shown = fromStep === toStep ? null : at.p;
      captionEls.forEach((element, index) => {
        let opacity = 0;
        let offset = 0;
        if (shown === null) {
          opacity = index === toStep ? 1 - leave : 0;
          offset = index === toStep ? -8 * leave : 0;
        } else if (index === fromStep) {
          const out = smooth(shown / 0.5);
          opacity = 1 - out;
          offset = -8 * out;
        } else if (index === toStep) {
          const into = smooth((shown - 0.5) / 0.5);
          opacity = into;
          offset = 8 * (1 - into);
        }
        gsap.set(element, { opacity, y: offset, filter: opacity > 0 && opacity < 1 ? `blur(${(6 * (1 - opacity)).toFixed(2)}px)` : 'none' });
      });
    };

    const context = gsap.context(() => {
      const driver = { t: 0 };
      const timeline = gsap.timeline();
      timeline.to(driver, { t: total, duration: total, ease: 'none', onUpdate: () => render(driver.t) }, 0);
      timeline.addLabel('start', 0);
      run.labels.forEach((at, index) => timeline.addLabel(`step-${index}`, at));
      timeline.addLabel('end', total);
      render(0);
      ScrollTrigger.create({
        trigger: pinEl,
        start: 'top top',
        end: () => `+=${window.innerHeight * pinScreens}`,
        pin: true,
        scrub,
        animation: timeline,
        invalidateOnRefresh: true,
        snap: { snapTo: 'labelsDirectional', delay: 0.15, duration: { min: 0.3, max: 0.8 }, ease: 'power2.inOut' },
      });
      const onRefresh = () => {
        run.remeasure();
        render(driver.t);
      };
      ScrollTrigger.addEventListener('refresh', onRefresh);
      return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    }, pinEl);
    return () => context.revert();
  }, [run, pinScreens, scrub]);

  return (
    <div ref={pin} className="story-pin">
      <div className="story-frame mx-auto max-w-6xl px-4 sm:px-6">
        <ol ref={captions} className="story-captions">
          {steps.map((step, index) => (
            <li key={step.id} className="story-caption">
              <span className="story-step">{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="story-stage" aria-hidden="true">
          {stage({ onRun: setRun })}
        </div>
      </div>
    </div>
  );
}
