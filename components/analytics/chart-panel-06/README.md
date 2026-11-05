# Chart Panel: Percentiles

Percentile lines in one hue from light to full strength, against an SLO line and how many hours went over it.

```tsx
import { ChartPanel6, chartPanel6ExampleProps } from "./chart-panel-06";

<ChartPanel6 {...chartPanel6ExampleProps} />;
```

`chartPanel6ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ChartPanel6Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/chart-panel-06
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/chart-panel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/chart-panel) (MIT).
