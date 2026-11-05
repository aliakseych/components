# Retention: Cohort Table

A retention triangle with one row per cohort and an average row weighted by cohort size.

```tsx
import { Retention1, retention1ExampleProps } from "./retention-01";

<Retention1 {...retention1ExampleProps} />;
```

`retention1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Retention1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/retention-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/retention/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/retention) (MIT).
