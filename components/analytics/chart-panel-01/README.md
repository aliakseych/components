# Chart Panel: Period Comparison

This period as an area against the previous one as a dashed line, with the change written as a sentence.

```tsx
import { ChartPanel1, chartPanel1ExampleProps } from "./chart-panel-01";

<ChartPanel1 {...chartPanel1ExampleProps} />;
```

`chartPanel1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ChartPanel1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/chart-panel-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/chart-panel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/chart-panel) (MIT).
