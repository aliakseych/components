# Pipeline: Weighted Forecast

Closed plus open deals weighted by the chance their stage closes, per owner, against quota.

```tsx
import { Pipeline4, pipeline4ExampleProps } from "./pipeline-04";

<Pipeline4 {...pipeline4ExampleProps} />;
```

`pipeline4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Pipeline4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/pipeline-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/pipeline/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/pipeline) (MIT).
