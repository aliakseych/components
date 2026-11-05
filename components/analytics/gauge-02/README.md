# Gauge: Health Score

An account health score marked on poor, fair and good bands, with the factors that pull it down most.

```tsx
import { Gauge2, gauge2ExampleProps } from "./gauge-02";

<Gauge2 {...gauge2ExampleProps} />;
```

`gauge2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Gauge2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/gauge-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/gauge/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/gauge) (MIT).
