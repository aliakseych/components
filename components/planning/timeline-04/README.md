# Timeline: Plan vs Actual

Each phase's plan as a dashed outline over what actually happened, with how many days it slipped.

```tsx
import { Timeline4, timeline4ExampleProps } from "./timeline-04";

<Timeline4 {...timeline4ExampleProps} />;
```

`timeline4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Timeline4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/timeline-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/timeline/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/timeline) (MIT).
