# Stats Band

A heading over a row of headline figures. The tiles come from `analytics/stat-group-01` (Stat Group: Plain Row) rendered with `bare`, so the band adds no card of its own and shows each value with its change against a previous figure.

```tsx
import { StatsBand } from "@/components/marketing/stats-band";

<StatsBand
  eyebrow="Performance"
  title="Fast and steady"
  backdrop="dots"
  items={[{ label: "Edge regions", value: 48, previous: 40 }]}
/>;
```

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Heading |
| `eyebrow` | `string` | Small label above the heading |
| `description` | `string` | Shown opposite the heading |
| `items` | `StatsBandItem[]` | `label`, `value`, `previous`, `suffix`, `format`, `changeType` and `goodDirection` |
| `comparison` | `string` | Follows each previous value, such as `the year before` |
| `backdrop` | `"dots" \| "none"` | Decorative dot grid behind the content. @default `"none"` |
| `dotColor` | `string` | Any CSS colour for the dots. Sets `--stats-band-dot`. @default `var(--border)` |
| `colors` | `{ foreground?, muted?, accent? }` | Any CSS colour per text role. Sets `--stats-band-foreground`, `--stats-band-muted` and `--stats-band-accent`. Unset keys use `--foreground`, `--muted-foreground` and `--chart-1` |

The section paints no background. It takes its surface from the page.

## Changes from the first version

The band used to draw its own figures with sparkline, tick, histogram and dot graphics. Those are gone: the figure now comes from the reused tile, which shows value, label and change only. The `note` field was removed with them.

## Origin

Inspired by https://21st.dev/@kuratlielia/components/stats-band; the tiles are the dashboardblocks Stat Group.
