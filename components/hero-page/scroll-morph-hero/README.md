# Scroll Morph Hero

Inspired by https://21st.dev/@prashantsom75/components/scroll-morph-hero; independently written.

On load, scattered tiles gather into a ring around the headline. Scrolling spreads the ring into an arc. Progress comes from the section's position in its nearest scroller, read in a rAF-throttled listener. With reduced motion the ring and headline are drawn statically with no intro and no sticky scrolling.

```tsx
import { ScrollMorphHero } from "@/components/hero-page/scroll-morph-hero";

<ScrollMorphHero
  items={[{ label: "Northwind" }, { label: "Harbor", tone: "chart-2" }]}
  headline="The future is built on AI."
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ label: string; src?: string; tone?: "chart-1" \| ... \| "chart-5" }[]` | required | Without `src`, the tile is a gradient in `tone`. |
| `headline` | `string` | `"The future is built on AI."` | Sits inside the ring; fades out as the tiles move. |
| `hint` | `string` | `"Scroll to explore"` | Hidden with reduced motion. |
| `endTitle` | `string` | | Shown once the tiles reach the arc. |
| `progress` | `number` | | Pins the morph from 0 (ring) to 1 (arc) and ignores scroll. Used for previews. |
| `stageHeight` | `string` | `"100svh"` | CSS height of the pinned stage. Set it when the hero scrolls inside a shorter container. |
| `colors` | `{ text?, muted?, border? }` | theme tokens | Colour roles, see Theming |

Other section props are passed through, including `className`.

## Theming

`colors`: `text` (headline and end title, default `var(--foreground)`), `muted` (scroll hint, `var(--muted-foreground)`) and `border` (tile outline, `var(--border)`). They are set on the root as `--scroll-morph-hero-*`. The section paints no background, so set the page background on its container. Tile tones still use the `chart-*` tokens.

## Origin

Inspired by https://21st.dev/@prashantsom75/components/scroll-morph-hero; independently written.
