# DashboardHeader: Dashboard Header

Full Header: The range and the comparison read as a sentence under the title, with each filter as a removable tag.

```tsx
import { DashboardHeader1, dashboardHeader1ExampleProps } from "./dashboard-header-01";

<DashboardHeader1 {...dashboardHeader1ExampleProps} />;
```

`dashboardHeader1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `DashboardHeader1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/dashboard-header-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/dashboard-header/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/dashboard-header) (MIT).
