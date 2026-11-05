# Status: Service List

Each service with its current status, the worst one above the title and every service that isn't operational named.

```tsx
import { Status1, status1ExampleProps } from "./status-01";

<Status1 {...status1ExampleProps} />;
```

`status1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Status1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/status-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/status/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/status) (MIT).
