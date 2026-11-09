# Halftone Footer

Inspired by https://21st.dev/@kedhareswer/components/halftone-wordmark-footer; independently written.

A footer whose wordmark is sampled from text into a 6px grid of dots on a canvas. Each dot's radius follows its letter coverage, and the bottom 20% of the word is cropped. The pointer pushes nearby dots away and they spring back, shifting from ink to warm colour as they move. A click outside a link sends a ring through the dots. Reduced motion draws the static dot field with no pointer reaction.

```tsx
import { HalftoneFooter } from "@/components/marketing/halftone-footer";

<HalftoneFooter
  word="NORTHWIND"
  preset="ember"
  studio="Northwind Studio, Oslo"
  columns={[{ title: "Index", links: [{ label: "Work", href: "/work" }] }]}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `word` | `string` | `"NORTHWIND"` | Fitted by height (visible glyphs cover 95% of the canvas); may bleed past the sides. Also the canvas's accessible name. |
| `height` | `number` | `560` | Canvas height in px. |
| `grid` | `number` | `6` | Dot cell size in px. |
| `grain` | `number` | `0.09` | Grain overlay strength, from 0 to 1. |
| `preset` | `"ink" \| "paper" \| "ember" \| "cobalt"` | `"ink"` | Maps to theme tokens. |
| `colors` | `{ background?, ink?, warm? }` | from `preset` | CSS colours. Each key overrides the preset. |
| `studio` | `string` | `"Northwind Studio, 2026"` | Small uppercase line above the links. |
| `columns` | `{ title: string; links: { label: string; href: string }[] }[]` | placeholder columns | Two-column mono links on phones, three from `sm`. |
| `backToTopLabel` | `string` | `"Back to top"` | Scrolls to the top of the page. |

Presets: `ink` uses background, foreground and primary. `paper` uses muted and muted-foreground. `ember` tints the background with primary. `cobalt` uses chart-1 and chart-2 for the dots. Colours resolve from CSS on mount and repaint when the theme changes.

Other footer props are passed through, including `className`.

## Origin

Inspired by https://21st.dev/@kedhareswer/components/halftone-wordmark-footer; independently written.
