# Comparison: Before and After

Two values per row on a shared scale, with a hollow dot for before and a filled dot for after.

```tsx
import { Comparison4, comparison4ExampleProps } from "./comparison-04";

<Comparison4 {...comparison4ExampleProps} />;
```

`comparison4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Comparison4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/comparison-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/comparison/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/comparison) (MIT).
