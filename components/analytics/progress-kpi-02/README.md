# KPI: Status Breakdown

The share of work done, as one bar split by status, with a count for each.

```tsx
import { ProgressKPI2, progressKpi2ExampleProps } from "./progress-kpi-02";

<ProgressKPI2 {...progressKpi2ExampleProps} />;
```

`progressKpi2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ProgressKPI2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/progress-kpi-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
