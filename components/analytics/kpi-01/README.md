# KPI: Headline

A value with its change and what it's compared with.

```tsx
import { KPI1, kpi1ExampleProps } from "./kpi-01";

<KPI1 {...kpi1ExampleProps} />;
```

`kpi1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `KPI1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/kpi-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
