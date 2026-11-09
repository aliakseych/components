# Wave Spinner

Inspired by https://21st.dev/@heygaia/components/wave-spinner; independently written.

A grid of square cells that pulse in a wave. Each cell fades between two colours as the wave passes through it, so the wave reads as a colour sweep. The delay comes from the cell's place in the pattern: `diagonal` runs from the top-left corner, and `center` and `plus` ripple out from the middle.

```tsx
import { WaveSpinner } from "@/components/dashboard/wave-spinner";

<WaveSpinner
  pattern="center"
  rows={3}
  cols={3}
  colors={["var(--chart-3)", "var(--chart-1)"]}
  label="Loading invoices"
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `rows` | `number` | `4` | Grid rows. `plus` ignores it and is always 3 |
| `cols` | `number` | `4` | Grid columns. `plus` ignores it and is always 3 |
| `size` | `number` | `10` | Width and height of one cell in pixels |
| `gap` | `number` | `4` | Space between cells in pixels |
| `pattern` | `"diagonal" \| "center" \| "plus"` | `"diagonal"` | `diagonal` delays by `row + col`. `center` delays by Chebyshev distance from the middle. `plus` is 3 by 3 with the corners hidden, delayed as `center` |
| `duration` | `number` | `0.7` | Seconds for one pulse of a cell |
| `step` | `number` | `0.12` | Seconds between neighbouring steps of the wave |
| `colors` | `[string, string]` | `["var(--muted-foreground)", "var(--primary)"]` | `[from, to]` colours, passed as CSS values |
| `label` | `string` | `"Loading"` | Screen reader text in a `role="status"` region |
| `className` | `string` | | Also accepts every other `span` prop |

With `prefers-reduced-motion: reduce`, the cells stop and sit at a mid-state between the two colours.

## Origin

Inspired by https://21st.dev/@heygaia/components/wave-spinner; independently written.
