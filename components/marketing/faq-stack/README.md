# FAQ Stack

620px-wide centred list (full width on small screens). Opening one row closes the others. The answer reveals with `grid-template-rows 0fr→1fr` and opacity: 420ms / 260ms opening, 340ms / 220ms closing, all `cubic-bezier(.4,0,.2,1)`; the question's bottom padding shrinks to 12px and the vertical bar of the plus fades over the same curve. Keyboard activation (click detail 0) skips the transitions. Closed answers are `inert`. Reduced motion removes all transitions.

```tsx
<FaqStack title="Frequently asked" items={[{ question: "Cost?", answer: "A flat rate." }]} defaultOpen={0} />
```

- `defaultOpen` is the initially open index; `-1` starts closed.
