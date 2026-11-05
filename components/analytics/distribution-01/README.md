# Distribution: Histogram

Response times in buckets with p50, p95 and p99 lines, and the share over the SLO in red.

```tsx
import { Distribution1, distribution1ExampleProps } from "./distribution-01";

<Distribution1 {...distribution1ExampleProps} />;
```

`distribution1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Distribution1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/distribution-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/distribution/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/distribution) (MIT).
