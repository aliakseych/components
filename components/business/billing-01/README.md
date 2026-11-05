# Billing: MRR Movement

Ending MRR against the start of the month, net new MRR and net revenue retention, over a waterfall of the steps between them.

```tsx
import { Billing1, billing1ExampleProps } from "./billing-01";

<Billing1 {...billing1ExampleProps} />;
```

`billing1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Billing1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/billing-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/billing/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/billing) (MIT).
