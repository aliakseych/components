# Billing: Revenue Summary

MRR, ARR, ARPU and net revenue retention, each with its change from the previous month written out.

```tsx
import { Billing4, billing4ExampleProps } from "./billing-04";

<Billing4 {...billing4ExampleProps} />;
```

`billing4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Billing4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/billing-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/billing/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/billing) (MIT).
