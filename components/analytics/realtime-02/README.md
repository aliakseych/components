# Realtime: Throughput

Requests per second over the last five minutes, with the peak, the error rate and errors on their own scale.

```tsx
import { Realtime2, realtime2ExampleProps } from "./realtime-02";

<Realtime2 {...realtime2ExampleProps} />;
```

`realtime2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Realtime2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/realtime-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/realtime/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/realtime) (MIT).
