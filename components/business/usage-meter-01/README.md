# Usage Meter: Quota

An API quota with its status, when it resets, the usage it's on pace for and the date it would hit the limit.

```tsx
import { UsageMeter1, usageMeter1ExampleProps } from "./usage-meter-01";

<UsageMeter1 {...usageMeter1ExampleProps} />;
```

`usageMeter1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `UsageMeter1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/usage-meter-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/usage-meter/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/usage-meter) (MIT).
