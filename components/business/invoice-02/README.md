# Invoice: Receipt

A paid receipt with the payment method, a partial refund and the net amount paid.

```tsx
import { Invoice2, invoice2ExampleProps } from "./invoice-02";

<Invoice2 {...invoice2ExampleProps} />;
```

`invoice2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Invoice2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/invoice-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/invoice/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/invoice) (MIT).
