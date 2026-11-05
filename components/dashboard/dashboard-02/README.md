# Dashboard: SaaS dashboard

A SaaS dashboard: metric tabs, an activity heatmap, MRR by region, MRR movement, retention milestones and service status, filtered by plan.

```tsx
import { Dashboard2, dashboard2ExampleProps } from "./dashboard-02";

<Dashboard2 {...dashboard2ExampleProps} />;
```

`dashboard2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Dashboard2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboards/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs) (MIT).
