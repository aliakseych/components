# Stat Group: With Sparklines

Each metric with a 14-day sparkline, under a sentence saying how many improved.

```tsx
import { StatGroup2, statGroup2ExampleProps } from "./stat-group-02";

<StatGroup2 {...statGroup2ExampleProps} />;
```

`statGroup2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `StatGroup2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/stat-group-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/stat-group/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/stat-group) (MIT).
