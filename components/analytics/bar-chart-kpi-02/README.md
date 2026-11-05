# KPI: Actual vs Goal

Each day's value with its goal marked on the bar, and the days that met it solid.

```tsx
import { BarChartKPI2, barChartKpi2ExampleProps } from "./bar-chart-kpi-02";

<BarChartKPI2 {...barChartKpi2ExampleProps} />;
```

`barChartKpi2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `BarChartKPI2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/bar-chart-kpi-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
