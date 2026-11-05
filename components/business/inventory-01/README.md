# Inventory: Low Stock

Items at or near their reorder point, soonest to run out first, with how much to order and which will run out before an order arrives.

```tsx
import { Inventory1, inventory1ExampleProps } from "./inventory-01";

<Inventory1 {...inventory1ExampleProps} />;
```

`inventory1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Inventory1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/inventory-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/inventory/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/inventory) (MIT).
