# DashboardHeader: Dashboard Header

Compact: The date range as part of the title, with the exact dates under it and export beside it.

```tsx
import { DashboardHeader2, dashboardHeader2ExampleProps } from "./dashboard-header-02";

<DashboardHeader2 {...dashboardHeader2ExampleProps} />;
```

`dashboardHeader2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `DashboardHeader2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-header-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboard-header/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/dashboard-header) (MIT).
