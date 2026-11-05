# Invoice: Invoice

An overdue invoice with a discount, sales tax, a deposit and the balance due, how to pay, and a reminder you can send.

```tsx
import { Invoice1, invoice1ExampleProps } from "./invoice-01";

<Invoice1 {...invoice1ExampleProps} />;
```

`invoice1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Invoice1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/invoice-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/invoice/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/invoice) (MIT).
