# Realtime: Right Now

Active users, page views per second over the last minute and the pages with the most people on them.

```tsx
import { Realtime1, realtime1ExampleProps } from "./realtime-01";

<Realtime1 {...realtime1ExampleProps} />;
```

`realtime1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Realtime1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/realtime-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/realtime/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/realtime) (MIT).
