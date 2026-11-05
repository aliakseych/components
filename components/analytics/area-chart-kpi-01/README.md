# KPI: Area Chart

Gross profit with its margin, profit drawn inside revenue by day, and the day with the best margin.

```tsx
import { AreaChartKPI1, areaChartKpi1ExampleProps } from "./area-chart-kpi-01";

<AreaChartKPI1 {...areaChartKpi1ExampleProps} />;
```

`areaChartKpi1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AreaChartKPI1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/area-chart-kpi-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
