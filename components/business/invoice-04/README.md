# Invoice: Packing Slip

Items with their SKU and bin, a checkbox for each one picked, and a scannable barcode of the order number.

```tsx
import { Invoice4, invoice4ExampleProps } from "./invoice-04";

<Invoice4 {...invoice4ExampleProps} />;
```

`invoice4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Invoice4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/invoice-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/invoice/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/invoice) (MIT).
