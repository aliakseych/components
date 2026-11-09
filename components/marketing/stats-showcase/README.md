# Stats: Showcase

Inspired by https://21st.dev/@shadcnui-blocks/components/stats-06; independently written.

A heading and subtitle over a two-by-two grid of stat cards, two columns on phones too. Each card has a lucide icon in a tinted chip, a large tabular number, a label, and a bar. The bar width is `value / max` of the same value shown, so the graphic and the number cannot disagree.

```tsx
import { Users, Star } from "lucide-react";
import { StatsShowcase } from "./index";

<StatsShowcase
  title="This year so far"
  stats={[
    { value: 8421, label: "Teams onboarded", icon: Users, max: 10000 },
    { value: 4.8, suffix: " / 5", label: "Average rating", icon: Star, max: 5 },
  ]}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | Placeholder title | Heading |
| `subtitle` | `string` | Placeholder line | Under the heading |
| `stats` | `StatItem[]` | Four placeholder stats | `{ value, suffix?, label, icon, max? }`. `icon` is a lucide component. `max` defaults to 100 |
| `formatValue` | `(value: number) => string` | `Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })` | Formats the number. Use a locale formatter for other locales |
| `colors` | `StatsShowcaseColors` | theme tokens | Colour roles, see Theming |

## Theming

`colors` sets the colour roles, each a CSS colour: `surface` (card), `border` (card border), `track` (bar track) and `muted` (labels and units). Defaults are `var(--card)`, `var(--border)`, `var(--muted)` and `var(--muted-foreground)`. The chips and bars keep the `chart-1` to `chart-5` tokens by card position. The component paints no page background; the demo wrapper does.

The component renders a `section` and forwards other native props to it.

## Install in an app

Copy the folder into the app. It uses no shadcn parts.

## Origin

Inspired by https://21st.dev/@shadcnui-blocks/components/stats-06; independently written.
