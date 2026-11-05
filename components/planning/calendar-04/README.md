# Calendar: Rooms

A day of meeting room bookings, with a column per room and whether it's free right now.

```tsx
import { Calendar4, calendar4ExampleProps } from "./calendar-04";

<Calendar4 {...calendar4ExampleProps} />;
```

`calendar4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Calendar4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/calendar-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/calendar/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/calendar) (MIT).
