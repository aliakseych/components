# Calendar: Week

A week on an hour axis that opens at working hours, with all-day events at the top and the selected event's details.

```tsx
import { Calendar2, calendar2ExampleProps } from "./calendar-02";

<Calendar2 {...calendar2ExampleProps} />;
```

`calendar2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Calendar2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/calendar-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/calendar/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/calendar) (MIT).
