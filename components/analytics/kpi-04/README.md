# KPI: Provenance

A value with a button that says how it was computed: what's counted, the dates, the filters, the query and a link to the rows.

```tsx
import { KPI4, kpi4ExampleProps } from "./kpi-04";

<KPI4 {...kpi4ExampleProps} />;
```

`kpi4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `KPI4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/kpi-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kpi/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kpi) (MIT).
