# Funnel: Segment Comparison

Two segments as lines through every stage, each as a share of its first step, with the gap between them shaded.

```tsx
import { Funnel4, funnel4ExampleProps } from "./funnel-04";

<Funnel4 {...funnel4ExampleProps} />;
```

`funnel4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Funnel4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/funnel-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/funnel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/funnel) (MIT).
