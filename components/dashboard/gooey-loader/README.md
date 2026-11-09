# Gooey Loader

Inspired by https://21st.dev/@animbits/components/loaders-gooey-blobs; independently written.

Three circles swing side to side, merge and separate. Each circle swings on a sine curve and is offset in time, so the group ripples. An SVG filter (a Gaussian blur, then a colour matrix that thresholds the alpha, then a blend) makes the meeting points gooey. Colour defaults to `var(--primary)` and can be set with `color`.

```tsx
import { GooeyLoader } from "@/components/dashboard/gooey-loader";

<GooeyLoader size={20} color="var(--chart-1)" label="Saving" />;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `number` | `20` | Diameter of each circle in pixels. Travel and scale follow it |
| `gap` | `number` | `4` | Space between circles in pixels |
| `color` | `string` | `"var(--primary)"` | Any CSS colour for the circles |
| `colors` | `GooeyLoaderColors` | | `{ accent }`, an alias for `color`. Wins over `color` when set |
| `speed` | `number` | `1.4` | Seconds for one full swing |
| `label` | `string` | `"Loading"` | Screen reader text in a `role="status"` region |
| `className` | `string` | | Also accepts every other `div` prop |

Each circle swings 15px at the default size (0.75 of `size`) and grows to 1.2 times its size at the ends of the swing. With `prefers-reduced-motion: reduce`, the circles stop in place.

## Origin

Inspired by https://21st.dev/@animbits/components/loaders-gooey-blobs; independently written.
