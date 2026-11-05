# Chart Panel: Stacked Bars

Monthly totals split by category, with the average marked and the latest total labelled.

```tsx
import { ChartPanel3, chartPanel3ExampleProps } from "./chart-panel-03";

<ChartPanel3 {...chartPanel3ExampleProps} />;
```

`chartPanel3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ChartPanel3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/chart-panel-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/chart-panel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/chart-panel) (MIT).
