# Dashboard: Web analytics dashboard

A web analytics dashboard: traffic tabs, visitors right now, a traffic flow, top pages, top countries and browsers, filtered by device.

```tsx
import { Dashboard3, dashboard3ExampleProps } from "./dashboard-03";

<Dashboard3 {...dashboard3ExampleProps} />;
```

`dashboard3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Dashboard3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboards/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs) (MIT).
