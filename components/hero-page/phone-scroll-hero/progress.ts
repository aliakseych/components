import { createContext, useContext } from "react";

/** Scroll state of the hero, published every rendered frame to the screen inside the phone. */
export type HeroProgress = {
  /** Scroll distance into the story, in screen heights. */
  phase: number;
  /** Highest phase reached so far; lets a screen hurry timed content when the visitor scrolls ahead. */
  seen: number;
  /** 0 to 1 arrival of the source cards and connectors. */
  nodes: number;
  /** 0 to 1 expansion of the screen into its detail view, eased over 760ms once the open threshold is crossed. */
  expansion: number;
  /** Milliseconds since the detail view started revealing its content, negative before that. */
  contentElapsed: number;
  /** 0 to 1 scrub of the detail view's content after it has opened. */
  detailProgress: number;
  mobile: boolean;
  reduced: boolean;
};

export type HeroStore = {
  get: () => HeroProgress;
  subscribe: (listener: () => void) => () => void;
  /** A screen sets this to false while timed content (a chat) still plays; the hero waits before expanding. */
  setReady: (ready: boolean) => void;
  isReady: () => boolean;
};

export const restingProgress: HeroProgress = {
  phase: 0,
  seen: 1,
  nodes: 0,
  expansion: 0,
  contentElapsed: -1e4,
  detailProgress: 0,
  mobile: false,
  reduced: false,
};

export function createHeroStore(onReadyChange: () => void = () => {}): HeroStore & {
  set: (next: HeroProgress) => void;
} {
  let state = restingProgress;
  let ready = true;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    setReady(next) {
      if (next === ready) return;
      ready = next;
      onReadyChange();
    },
    isReady: () => ready,
  };
}

const staticStore = createHeroStore();

export const HeroProgressContext = createContext<HeroStore>(staticStore);

/** The hero's progress store. Outside a hero it reports a resting, fully seen state. */
export function useHeroStore() {
  return useContext(HeroProgressContext);
}

export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep. */
export const ease = (v: number) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** Cubic in-out. */
export const smooth = (v: number) => {
  v = clamp(v);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
