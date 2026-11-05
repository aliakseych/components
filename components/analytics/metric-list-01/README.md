# Metric List: Sparklines

Metrics with their change and a 14-day sparkline.

```tsx
import { MetricList1, metricList1ExampleProps } from "./metric-list-01";

<MetricList1 {...metricList1ExampleProps} />;
```

`metricList1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `MetricList1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/metric-list-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/metric-list/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/metric-list) (MIT).
