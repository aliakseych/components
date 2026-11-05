# Chart Panel: Highlighted Bar

A single series with the latest period highlighted against a goal line, and how far off the goal it is.

```tsx
import { ChartPanel4, chartPanel4ExampleProps } from "./chart-panel-04";

<ChartPanel4 {...chartPanel4ExampleProps} />;
```

`chartPanel4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ChartPanel4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/chart-panel-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/chart-panel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/chart-panel) (MIT).
