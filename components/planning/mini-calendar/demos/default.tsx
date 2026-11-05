import { MiniCalendar, MiniCalendarDay, MiniCalendarDays, MiniCalendarNavigation } from "../index";

export default function Demo() {
  return (
    <MiniCalendar defaultValue={new Date()} days={5}>
      <MiniCalendarNavigation aria-label="Previous days" direction="prev" />
      <MiniCalendarDays>
        {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
      </MiniCalendarDays>
      <MiniCalendarNavigation aria-label="Next days" direction="next" />
    </MiniCalendar>
  );
}
