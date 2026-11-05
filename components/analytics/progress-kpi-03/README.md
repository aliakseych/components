# KPI: Goal Ring

A count against a goal as a ring, with how many are left and how many a day that takes.

```tsx
import { ProgressKPI3, progressKpi3ExampleProps } from "./progress-kpi-03";

<ProgressKPI3 {...progressKpi3ExampleProps} />;
```

`progressKpi3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ProgressKPI3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/progress-kpi-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
