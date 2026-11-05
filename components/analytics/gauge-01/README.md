# Gauge: Net Promoter Score

NPS on its full −100 to 100 scale, with the change since last period and the split of promoters, passives and detractors.

```tsx
import { Gauge1, gauge1ExampleProps } from "./gauge-01";

<Gauge1 {...gauge1ExampleProps} />;
```

`gauge1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Gauge1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/gauge-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/gauge/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/gauge) (MIT).
