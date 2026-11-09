# Logo Cloud: Checkerboard

Inspired by https://21st.dev/@efferd/components/logo-cloud-2; independently written.

An optional eyebrow and heading over a grid of logo cells joined by thin shared borders. Cells alternate between a tinted fill and transparent in a checkerboard, using `(row + col) % 2`. Phones show 2 columns, tablets 3, and desktop uses `columns`. The checkerboard is recomputed for each breakpoint, so the pattern stays correct when the column count changes. On hover or keyboard focus a logo scales to about 1.12 and moves from muted to full foreground colour, over 200ms. Reduced motion keeps the colour change and drops the scale.

The logos in `placeholders.tsx` are SVG wordmarks drawn with text and shapes in `currentColor`. Replace them with your own marks through `node`.

```tsx
import { LogoCloud } from "./index";

<LogoCloud
  eyebrow="Customers"
  heading="Trusted by product teams."
  logos={[
    { name: "Northwind", node: <NorthwindMark className="h-6 w-auto" /> },
    { name: "Harbor", node: <HarborMark className="h-6 w-auto" />, href: "/case-studies/harbor" },
  ]}
  columns={4}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `logos` | `{ name: string; node: ReactNode; href?: string }[]` | required | `name` is read by screen readers; `node` is drawn in the cell; `href` makes the cell a link |
| `eyebrow` | `string` | none | Small uppercase line above the heading |
| `heading` | `string` | `"Companies we work with."` | Centred heading; pass an empty string to hide it |
| `description` | `string` | none | Line under the heading |
| `columns` | `number` | `4` | Column count from `lg` up. Phones use 2, tablets 3 |
| `rounded` | `boolean` | `true` | Rounds the outer corners of the grid |
| `cellColor` | `string` | `"var(--muted)"` | Fill of the tinted cells. Any CSS colour, such as `color-mix(...)` |
| `borderColor` | `string` | `"var(--border)"` | Colour of the shared grid lines |

`cellColor` and `borderColor` are set as the custom properties `--logo-cell` and `--logo-border` on the `section`. The component paints no page background, and it forwards other native props and `className` to the `section`.

## Demos

- `default`: eight logos, four columns, eyebrow and description.
- `compact`: six logos, three columns, and a `color-mix` cell tint from `--chart-2`.

## Install in an app

Copy the folder into the app. It uses no shadcn parts and no third-party packages.

## Origin

Inspired by https://21st.dev/@efferd/components/logo-cloud-2; independently written.
