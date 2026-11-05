# Schedule: Calendar

A month calendar with a dot for each event, listing the selected day's events.

```tsx
import { Schedule2, schedule2ExampleProps } from "./schedule-02";

<Schedule2 {...schedule2ExampleProps} />;
```

`schedule2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Schedule2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/schedule-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/schedule/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/schedule) (MIT).
