# Breakdown: Segmented Bar

A single 100% bar with each category's value and share listed below.

```tsx
import { Breakdown1, breakdown1ExampleProps } from "./breakdown-01";

<Breakdown1 {...breakdown1ExampleProps} />;
```

`breakdown1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Breakdown1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/breakdown-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/breakdown/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/breakdown) (MIT).
