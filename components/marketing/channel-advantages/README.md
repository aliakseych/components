# Channel Advantages

Dark navy section: eyebrow, 48px headline, lead, a three-column grid of six benefits with 64px round icons, a blurred blue glow in the lower-left corner, and three gradient stat tiles whose lower part overlaps a page-coloured strip. Heading, copy and tiles reveal on scroll (gsap, y 24 / 16 / 80, `power3.out`, once).

```tsx
<ChannelAdvantages
  title="Run every channel from one place"
  items={[{ title: "One admin", body: "One catalog and one order queue." }]}
  stats={[{ value: "Agreed", label: "Setup fee", description: "Set in the proposal" }]}
/>
```

- `items[].icon` replaces the built-in glyph (`AdvantageIcon` is exported).
- `colors` sets `surface`, `sky`, `glow`; the strip behind the tiles uses `bg-background`.
- With `prefers-reduced-motion` no animation runs.
- Needs `gsap` (ScrollTrigger).
