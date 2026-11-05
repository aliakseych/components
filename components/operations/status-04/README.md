# Status: Region Health

Regions with their status, p95 latency and error rate.

```tsx
import { Status4, status4ExampleProps } from "./status-04";

<Status4 {...status4ExampleProps} />;
```

`status4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Status4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/status-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/status/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/status) (MIT).
