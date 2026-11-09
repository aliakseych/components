# Bento Grid

Inspired by https://21st.dev/@luv-jeri_c92deb60/components/bento-grid; independently written.

A heading over a responsive grid of rounded cards. Phones get one column. Desktop gets four, and `grid-flow-dense` fills gaps around wide, tall and full-width cards. Each card shows a numbered eyebrow, a title, a description and an optional tinted area. Cards lift slightly on hover, and that lift is disabled for reduced motion.

```tsx
import { BentoGrid } from "./index";

<BentoGrid
  title="Built for busy teams"
  items={[
    { title: "Plan in one place", description: "Goals and owners together.", span: "wide", tone: "chart-1" },
    { title: "Ship safely", tone: "chart-2" },
    { title: "Reviews", span: "tall", tone: "chart-3" },
  ]}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `"Everything your team needs"` | Heading |
| `items` | `BentoItem[]` | Five placeholder features | `{ eyebrow?, title, description?, span?, tone? }` |
| `colors` | `BentoGridColors` | theme tokens | Colour roles, see Theming |

`span` is `"normal"`, `"wide"` (two columns), `"tall"` (two rows) or `"full"` (all four columns on desktop). `tone` is `chart-1` to `chart-5`. The eyebrow defaults to the item number, such as `01`.

## Theming

`colors` sets the colour roles, each a CSS colour: `surface` (plain tile), `border` (plain tile border) and `muted` (eyebrow and description text). Defaults are `var(--card)`, `var(--border)` and `var(--muted-foreground)`. Tinted tiles keep the `chart-1` to `chart-5` tokens. The component paints no page background; the demo wrapper does.

The component renders a `section` and forwards other native props to it.

## Install in an app

Copy the folder into the app. It uses no shadcn parts.

## Origin

Inspired by https://21st.dev/@luv-jeri_c92deb60/components/bento-grid; independently written.
