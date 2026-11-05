# Comparison: A/B Test

Lift for a variant over the control, with a 95% confidence interval drawn against zero and a sentence on what it means.

```tsx
import { Comparison2, comparison2ExampleProps } from "./comparison-02";

<Comparison2 {...comparison2ExampleProps} />;
```

`comparison2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Comparison2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/comparison-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/comparison/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/comparison) (MIT).
