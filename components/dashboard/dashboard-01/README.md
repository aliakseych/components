# Dashboard: Store dashboard

A store dashboard: header filters scope stats, revenue, channels, products, a checkout funnel and month-to-date revenue, with low stock alongside.

```tsx
import { Dashboard1, dashboard1ExampleProps } from "./dashboard-01";

<Dashboard1 {...dashboard1ExampleProps} />;
```

`dashboard1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Dashboard1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboards/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs) (MIT).
