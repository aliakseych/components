# Inventory: Stock Projection

One item's stock day by day at its current demand, with incoming orders, the reorder point and the day it runs out.

```tsx
import { Inventory4, inventory4ExampleProps } from "./inventory-04";

<Inventory4 {...inventory4ExampleProps} />;
```

`inventory4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Inventory4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/inventory-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/inventory/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/inventory) (MIT).
