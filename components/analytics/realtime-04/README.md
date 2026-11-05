# Realtime: Today So Far

Running totals since midnight against yesterday at the same time, with orders per hour beside yesterday's.

```tsx
import { Realtime4, realtime4ExampleProps } from "./realtime-04";

<Realtime4 {...realtime4ExampleProps} />;
```

`realtime4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Realtime4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/realtime-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/realtime/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/realtime) (MIT).
