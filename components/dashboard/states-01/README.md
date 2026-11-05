# States: Skeleton

Placeholders sized to match the loaded stats, so nothing shifts when the data arrives.

```tsx
import { States1, states1ExampleProps } from "./states-01";

<States1 {...states1ExampleProps} />;
```

`states1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `States1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/states-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/states/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/states) (MIT).
