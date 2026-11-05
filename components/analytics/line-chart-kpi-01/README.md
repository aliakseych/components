# KPI: Line Chart

This week as a filled area over last week as a dashed line, with the days it fell behind written underneath.

```tsx
import { LineChartKPI1, lineChartKpi1ExampleProps } from "./line-chart-kpi-01";

<LineChartKPI1 {...lineChartKpi1ExampleProps} />;
```

`lineChartKpi1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `LineChartKPI1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/line-chart-kpi-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
