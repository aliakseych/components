# Stat Group: Period Bars

Four metrics, each with a bar for this period over a bar for the one before.

```tsx
import { StatGroup5, statGroup5ExampleProps } from "./stat-group-05";

<StatGroup5 {...statGroup5ExampleProps} />;
```

`statGroup5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `StatGroup5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/stat-group-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/stat-group/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/stat-group) (MIT).
