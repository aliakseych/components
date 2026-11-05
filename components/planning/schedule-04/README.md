# Schedule: Week Ahead

The next seven days on a shared time axis, with how much of each day is booked and the busiest day.

```tsx
import { Schedule4, schedule4ExampleProps } from "./schedule-04";

<Schedule4 {...schedule4ExampleProps} />;
```

`schedule4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Schedule4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/schedule-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/schedule/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/schedule) (MIT).
