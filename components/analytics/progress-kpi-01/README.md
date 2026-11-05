# KPI: Target Pace

Progress to a monthly target, with where the current pace ends the month and where an even pace would be today.

```tsx
import { ProgressKPI1, progressKpi1ExampleProps } from "./progress-kpi-01";

<ProgressKPI1 {...progressKpi1ExampleProps} />;
```

`progressKpi1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ProgressKPI1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/progress-kpi-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
