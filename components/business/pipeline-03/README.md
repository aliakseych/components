# Pipeline: Stuck Items

Items over their expected time in stage, longest over first, with how long they've waited and who owns them.

```tsx
import { Pipeline3, pipeline3ExampleProps } from "./pipeline-03";

<Pipeline3 {...pipeline3ExampleProps} />;
```

`pipeline3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Pipeline3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/pipeline-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/pipeline/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/pipeline) (MIT).
