# Billing: Current Plan

The plan and its price, when it renews, the next invoice and the payment method on file, with actions to manage them.

```tsx
import { Billing2, billing2ExampleProps } from "./billing-02";

<Billing2 {...billing2ExampleProps} />;
```

`billing2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Billing2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/billing-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/billing/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/billing) (MIT).
