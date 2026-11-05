# KPI: Bar Chart

The week's total with a bar for each day and the change on the week before.

```tsx
import { BarChartKPI1, barChartKpi1ExampleProps } from "./bar-chart-kpi-01";

<BarChartKPI1 {...barChartKpi1ExampleProps} />;
```

`barChartKpi1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `BarChartKPI1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/bar-chart-kpi-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
