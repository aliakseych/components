# Funnel: Columns

Each stage as a column on a 0 to 100% axis, topped by the share that left at that step, with the biggest drop named.

```tsx
import { Funnel2, funnel2ExampleProps } from "./funnel-02";

<Funnel2 {...funnel2ExampleProps} />;
```

`funnel2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Funnel2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/funnel-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/funnel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/funnel) (MIT).
