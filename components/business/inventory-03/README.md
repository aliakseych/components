# Inventory: Stock Health

The value of stock on hand and how many times a year it turns over, then every SKU by status.

```tsx
import { Inventory3, inventory3ExampleProps } from "./inventory-03";

<Inventory3 {...inventory3ExampleProps} />;
```

`inventory3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Inventory3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/inventory-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/inventory/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/inventory) (MIT).
