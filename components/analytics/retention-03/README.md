# Retention: Milestones

Day 1, 7 and 30 retention for the latest cohort, with the change against the cohort before.

```tsx
import { Retention3, retention3ExampleProps } from "./retention-03";

<Retention3 {...retention3ExampleProps} />;
```

`retention3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Retention3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/retention-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/retention/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/retention) (MIT).
