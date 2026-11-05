# Calendar

A month calendar where clicking a day opens a day strip and an hour-by-hour timeline.

```tsx
import { CalendarWithDayView } from "./calendar";

<CalendarWithDayView features={events} />;
```

## Exports

| Export | Use it for |
| --- | --- |
| `CalendarWithDayView` | The complete experience: month view, click a day, then the day view and back |
| `CalendarDayView` | Only the day strip and timeline, when you control the selected date |
| `CalendarBody` and the other `Calendar*` parts | Building your own layout. Pass `onDaySelect` to make days clickable |

Each event needs `id`, `name`, `startAt`, `endAt` and `status` (`id`, `name`, `color`).

## How the day view behaves

- It lists every event that overlaps the selected day, including multi-day events.
- Overlapping events sit side by side.
- An event covering the whole day appears in a separate row above the timeline.
- It opens scrolled to the first event, or to 08:00 on an empty day.
- A red line marks the current time when viewing today.
- The back button returns to the month of the selected date.

## Caveats

- The month grid shows an event only on its end date, as in Kibo's original. The day view shows it on every day it covers.
- The month and year are stored globally with Jotai, so two calendars on one page stay in sync.
- The timeline shows times in 24-hour format, using the browser's time zone.
- Install `planning/mini-calendar` too, as it's listed under `composes` in `meta.json`.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). `day-view.tsx` and `onDaySelect` were added here.
