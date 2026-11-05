# Invoice: Quote

Optional items to tick before accepting, with totals that follow, an expiry date and a signature block on the printed copy.

```tsx
import { Invoice3, invoice3ExampleProps } from "./invoice-03";

<Invoice3 {...invoice3ExampleProps} />;
```

`invoice3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Invoice3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/invoice-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/invoice/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/invoice) (MIT).
