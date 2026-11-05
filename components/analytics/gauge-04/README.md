# Gauge: Score Card

A satisfaction score with a target tick on the arc, the change since last period and the points left to the target.

```tsx
import { Gauge4, gauge4ExampleProps } from "./gauge-04";

<Gauge4 {...gauge4ExampleProps} />;
```

`gauge4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Gauge4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/gauge-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/gauge/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/gauge) (MIT).
