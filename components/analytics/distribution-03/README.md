# Distribution: Spread

The median, mean and percentiles of raw values, with a note when a long tail pulls the mean away from the median.

```tsx
import { Distribution3, distribution3ExampleProps } from "./distribution-03";

<Distribution3 {...distribution3ExampleProps} />;
```

`distribution3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Distribution3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/distribution-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/distribution/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/distribution) (MIT).
