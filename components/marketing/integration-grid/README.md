# Integration Grid

Perspective-tilted (40deg) 8x3 grid of tiles, scaled to fit its container. Tiles rise in with a 700ms `cubic-bezier(.25,.1,.25,1)` reveal staggered 60ms per row once 35% visible. Hover or focus lifts a tile 40px; clicking sends a ripple across the grid, and an idle ripple fires every 4.5-6.7s. Animation pauses off-screen, in hidden tabs and under reduced motion.

```tsx
<IntegrationGrid
  title="Works with the tools you already use."
  items={[{ name: "Ledger", icon: <svg viewBox="0 0 24 24">...</svg> }]}
  blurBottom
  blurHeight={320}
/>
```

- `items`: cycled to fill the 24 tiles; `icon` is rendered in a 176px box, use `currentColor` SVGs.
- `blurBottom` (default true) fades the bottom edge; `blurHeight` overrides the viewport height (default 320, 200 below 480px).
