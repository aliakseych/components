# Realtime: Live Activity

Orders, sign-ups, refunds and messages as they arrive, newest first, with a pause button.

```tsx
import { Realtime3, realtime3ExampleProps } from "./realtime-03";

<Realtime3 {...realtime3ExampleProps} />;
```

`realtime3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Realtime3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/realtime-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/realtime/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/realtime) (MIT).
