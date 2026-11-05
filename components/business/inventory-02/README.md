# Inventory: Warehouse Capacity

Units stored against capacity in each warehouse, with what arrives this week and where a warehouse counts as nearly full.

```tsx
import { Inventory2, inventory2ExampleProps } from "./inventory-02";

<Inventory2 {...inventory2ExampleProps} />;
```

`inventory2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Inventory2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/inventory-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/inventory/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/inventory) (MIT).
