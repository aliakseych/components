# Dashboard: CRM dashboard

A CRM dashboard: sales stats, open pipeline by stage, monthly bookings, lead conversion, a quarter forecast by rep, deal activity and stuck deals, filtered by segment.

```tsx
import { Dashboard4, dashboard4ExampleProps } from "./dashboard-04";

<Dashboard4 {...dashboard4ExampleProps} />;
```

`dashboard4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Dashboard4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboards/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs) (MIT).
