# Dashboard: DevOps dashboard

A DevOps dashboard: live throughput, delivery performance, response time percentiles, open alerts, uptime, build health and recent deployments, filtered by service.

```tsx
import { Dashboard5, dashboard5ExampleProps } from "./dashboard-05";

<Dashboard5 {...dashboard5ExampleProps} />;
```

`dashboard5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Dashboard5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboards/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs) (MIT).
