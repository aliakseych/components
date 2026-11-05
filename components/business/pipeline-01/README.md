# Pipeline: Board

A column per stage with its item count and total value, and a card per item with its owner, moved from its menu.

```tsx
import { Pipeline1, pipeline1ExampleProps } from "./pipeline-01";

<Pipeline1 {...pipeline1ExampleProps} />;
```

`pipeline1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Pipeline1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/pipeline-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/pipeline/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/pipeline) (MIT).
