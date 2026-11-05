# Goals: Daily Rings

Small daily goals as rings, each saying how many are left or how far past the goal it went.

```tsx
import { Goals4, goals4ExampleProps } from "./goals-04";

<Goals4 {...goals4ExampleProps} />;
```

`goals4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Goals4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/goals-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/goals/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/goals) (MIT).
