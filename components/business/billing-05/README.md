# Billing: Change Plan

Plans side by side, monthly or yearly, with seats, what's due today and what a downgrade takes away.

```tsx
import { Billing5, billing5ExampleProps } from "./billing-05";

<Billing5 {...billing5ExampleProps} />;
```

`billing5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Billing5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/billing-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/billing/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/billing) (MIT).
