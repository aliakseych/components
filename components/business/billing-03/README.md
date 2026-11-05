# Billing: Invoices

Recent invoices with their status and amount, what's outstanding, and a PDF download for each.

```tsx
import { Billing3, billing3ExampleProps } from "./billing-03";

<Billing3 {...billing3ExampleProps} />;
```

`billing3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Billing3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/billing-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/billing/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/billing) (MIT).
