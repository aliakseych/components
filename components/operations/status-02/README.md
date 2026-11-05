# Status: Uptime Bars

Ninety days of daily status per service.

```tsx
import { Status2, status2ExampleProps } from "./status-02";

<Status2 {...status2ExampleProps} />;
```

`status2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Status2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/status-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/status/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/status) (MIT).
