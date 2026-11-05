# Heatmap: Hot Spots

p95 latency by endpoint over the last 24 hours, with a dot on each window over the target.

```tsx
import { Heatmap4, heatmap4ExampleProps } from "./heatmap-04";

<Heatmap4 {...heatmap4ExampleProps} />;
```

`heatmap4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Heatmap4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/heatmap-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/heatmap/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/heatmap) (MIT).
