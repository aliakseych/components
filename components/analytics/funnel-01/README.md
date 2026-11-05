# Funnel: Stage Bars

Overall conversion, then each stage as a bar sized against the first, with its step conversion.

```tsx
import { Funnel1, funnel1ExampleProps } from "./funnel-01";

<Funnel1 {...funnel1ExampleProps} />;
```

`funnel1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Funnel1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/funnel-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/funnel/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/funnel) (MIT).
