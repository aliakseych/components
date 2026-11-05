# Status: Service Uptime

One service's uptime, incident count and downtime, with its daily history and recent incidents.

```tsx
import { Status5, status5ExampleProps } from "./status-05";

<Status5 {...status5ExampleProps} />;
```

`status5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Status5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/status-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/status/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/status) (MIT).
