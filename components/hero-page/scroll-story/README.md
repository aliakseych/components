# Scroll Story

A section that pins while the page scrolls. A GSAP ScrollTrigger scrubs a timeline: the right-hand element (by default a toast that arrives, stacks, opens, warns, loads, fails, retries, succeeds, asks for feedback and drifts away as a cloud) animates, and the captions on the left blur-swap between steps. After scrolling stops it snaps to the nearest step.

```tsx
<ScrollStory
  title="Life of a notification"
  steps={LIFE_CAPTIONS}
  stage={(props) => <ToastStage {...props} />}
  still={(index) => <ToastStill state={TOAST_PLATEAUS[index]!} />}
/>
```

Bring your own right-hand element: `stage` receives `onRun` and reports a `StoryRun` (duration, caption holds, snap labels, `render(t)`, `remeasure()`); `render` must be a pure function of `t` so scrubbing works both ways. `still(index)` draws the static version for reduced motion, where the pin is dropped and every step is a row. The toast puppet (`puppet*.ts(x)`, `life-data.ts`) is a decorative lookalike of the Cloudlet toaster drawn with theme tokens.

Props: `title`, `lead`, `steps`, `stage`, `still`, `pinScreens` (default 9), `scrub`, `motion` (`auto` follows `prefers-reduced-motion`, `reduced` forces the static layout).

Pinning needs the page itself to scroll; inside a nested scroll container, set ScrollTrigger's `scroller`.
