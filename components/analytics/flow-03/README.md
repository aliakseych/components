# Flow: Income Flow

Revenue streams into revenue, then out to costs and profit, with each part's share of revenue.

```tsx
import { Flow3, flow3ExampleProps } from "./flow-03";

<Flow3 {...flow3ExampleProps} />;
```

`flow3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Flow3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/flow-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/flow/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/flow) (MIT).
