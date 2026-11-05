# Stat Group: Plain Row

Metrics side by side, each with its change written as a sentence.

```tsx
import { StatGroup1, statGroup1ExampleProps } from "./stat-group-01";

<StatGroup1 {...statGroup1ExampleProps} />;
```

`statGroup1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `StatGroup1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/stat-group-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/stat-group/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/stat-group) (MIT).
