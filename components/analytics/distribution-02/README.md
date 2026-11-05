# Distribution: Box Plots

One box and whiskers per group on a shared axis, from the 5th to the 95th percentile.

```tsx
import { Distribution2, distribution2ExampleProps } from "./distribution-02";

<Distribution2 {...distribution2ExampleProps} />;
```

`distribution2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Distribution2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/distribution-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/distribution/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/distribution) (MIT).
