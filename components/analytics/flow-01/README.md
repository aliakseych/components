# Flow: Traffic Flow

Sessions from each source, through the landing page, to signing up, browsing on or bouncing, with the page that converts best named.

```tsx
import { Flow1, flow1ExampleProps } from "./flow-01";

<Flow1 {...flow1ExampleProps} />;
```

`flow1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Flow1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/flow-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/flow/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/flow) (MIT).
