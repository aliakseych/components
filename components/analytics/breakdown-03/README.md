# Breakdown: Waffle

A 10×10 grid where each square is 1% of the total.

```tsx
import { Breakdown3, breakdown3ExampleProps } from "./breakdown-03";

<Breakdown3 {...breakdown3ExampleProps} />;
```

`breakdown3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Breakdown3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/breakdown-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/breakdown/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/breakdown) (MIT).
