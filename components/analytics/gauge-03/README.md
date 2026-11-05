# Gauge: System Load

CPU, memory and disk as small gauges, each with its warning and critical thresholds.

```tsx
import { Gauge3, gauge3ExampleProps } from "./gauge-03";

<Gauge3 {...gauge3ExampleProps} />;
```

`gauge3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Gauge3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/gauge-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/gauge/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/gauge) (MIT).
