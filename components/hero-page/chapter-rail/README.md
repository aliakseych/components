# Chapter Rail

A fixed rail on the right edge with one dot per page section. The current dot morphs into a pill (spring-like cubic-bezier) whose fill follows scroll progress through the chapter; hovering or focusing a dot shows its label; clicking jumps to the section.

```tsx
<ChapterRail chapters={[{ id: 'intro', label: 'Intro' }, { id: 'faq', label: 'FAQ' }]} hideBeforeId="footer" />
```

Props: `chapters`, `headerOffset` (px), `hideBeforeId` (rail fades out when that element nears the top), `position` (`fixed` or `absolute`). Shown from 80rem wide. Under `prefers-reduced-motion` transitions are off and jumps are instant.

## Scroll story

`ScrollStory` (exported from the same module, `story.tsx`) is a section that pins while the page scrolls. A GSAP ScrollTrigger scrubs a timeline: the right-hand element (by default a toast that arrives, stacks, opens, warns, loads, fails, retries, succeeds, asks for feedback and drifts away as a cloud) animates, and the captions on the left blur-swap between steps. After scrolling stops it snaps to the nearest step. Give it an `id` and list it in `chapters` so the rail tracks and fills through it (demo `story`).

```tsx
<ScrollStory
  id="story"
  title="Life of a notification"
  steps={LIFE_CAPTIONS}
  stage={(props) => <ToastStage {...props} />}
  still={(index) => <ToastStill state={TOAST_PLATEAUS[index]!} />}
/>
```

Bring your own right-hand element: `stage` receives `onRun` and reports a `StoryRun` (duration, caption holds, snap labels, `render(t)`, `remeasure()`); `render` must be a pure function of `t` so scrubbing works both ways. `still(index)` draws the static version for reduced motion, where the pin is dropped and every step is a row (demo `static-sequence`). The toast puppet (`puppet*.ts(x)`, `life-data.ts`, `toast-scene.tsx`) is a decorative lookalike of the Cloudlet toaster drawn with theme tokens.

Props: `title`, `lead`, `steps`, `stage`, `still`, `id`, `pinScreens` (default 9), `scrub`, `motion` (`auto` follows `prefers-reduced-motion`, `reduced` forces the static layout). Pinning needs the page itself to scroll; inside a nested scroll container, set ScrollTrigger's `scroller`.
