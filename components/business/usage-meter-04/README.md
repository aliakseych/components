# Usage Meter: Prepaid Credits

A credit balance with the days left, the date it runs out and recent daily use against the average.

```tsx
import { UsageMeter4, usageMeter4ExampleProps } from "./usage-meter-04";

<UsageMeter4 {...usageMeter4ExampleProps} />;
```

`usageMeter4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `UsageMeter4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/usage-meter-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/usage-meter/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/usage-meter) (MIT).
