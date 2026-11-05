# Heatmap: Weekday by Hour

When visitors arrive, by day of the week and hour of the day, with each hour's total in bars above the grid.

```tsx
import { Heatmap1, heatmap1ExampleProps } from "./heatmap-01";

<Heatmap1 {...heatmap1ExampleProps} />;
```

`heatmap1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Heatmap1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/heatmap-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/heatmap/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/heatmap) (MIT).
