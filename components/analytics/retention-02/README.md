# Retention: Retention Curves

Every cohort's curve, with one highlighted against the average, and a line where the average levels off.

```tsx
import { Retention2, retention2ExampleProps } from "./retention-02";

<Retention2 {...retention2ExampleProps} />;
```

`retention2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Retention2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/retention-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/retention/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/retention) (MIT).
