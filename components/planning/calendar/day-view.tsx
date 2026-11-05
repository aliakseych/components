"use client";

import {
  addDays,
  differenceInMinutes,
  endOfDay,
  format,
  isSameDay,
  isToday,
  max,
  min,
  startOfDay,
} from "date-fns";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/planning/mini-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  type CalendarState,
  CalendarYearPicker,
  type Feature,
  type Status,
  useCalendarMonth,
  useCalendarYear,
} from "./index";

const MINUTES_IN_DAY = 24 * 60;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const featuresOnDay = (features: Feature[], date: Date) =>
  features.filter(
    (feature) =>
      new Date(feature.startAt) <= endOfDay(date) &&
      new Date(feature.endAt) >= startOfDay(date)
  );

/** Places overlapping features side by side. */
const layoutEvents = (features: Feature[], date: Date) => {
  const dayStart = startOfDay(date);
  const events = features
    .map((feature) => {
      const start = max([new Date(feature.startAt), dayStart]);
      const end = min([new Date(feature.endAt), endOfDay(date)]);
      const top = differenceInMinutes(start, dayStart);
      return {
        feature,
        top,
        // Keep very short events tall enough to read and click.
        bottom: Math.max(differenceInMinutes(end, dayStart), top + 30),
      };
    })
    .sort((a, b) => a.top - b.top || b.bottom - a.bottom);

  const laneEnds: number[] = [];
  const placed = events.map((event) => {
    let lane = laneEnds.findIndex((end) => end <= event.top);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = event.bottom;
    return { ...event, lane };
  });

  return { placed, lanes: Math.max(1, laneEnds.length) };
};

export type CalendarDayViewProps = {
  date: Date;
  onDateChange: (date: Date) => void;
  features: Feature[];
  /** Shows a back button when provided. */
  onBack?: () => void;
  backLabel?: string;
  /** Pixels per hour. */
  hourHeight?: number;
  /** Number of days in the strip above the timeline. */
  days?: number;
  emptyLabel?: string;
  renderEvent?: (feature: Feature) => ReactNode;
  className?: string;
};

export const CalendarDayView = ({
  date,
  onDateChange,
  features,
  onBack,
  backLabel = "Back to month",
  hourHeight = 48,
  days = 7,
  emptyLabel = "Nothing scheduled",
  renderEvent,
  className,
}: CalendarDayViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stripStart, setStripStart] = useState(() =>
    addDays(date, -Math.floor(days / 2))
  );
  const pxPerMinute = hourHeight / 60;

  const { allDay, timed } = useMemo(() => {
    const onDay = featuresOnDay(features, date);
    const isAllDay = (feature: Feature) =>
      new Date(feature.startAt) <= startOfDay(date) &&
      new Date(feature.endAt) >= endOfDay(date);
    return {
      allDay: onDay.filter(isAllDay),
      timed: onDay.filter((feature) => !isAllDay(feature)),
    };
  }, [features, date]);
  const { placed, lanes } = useMemo(
    () => layoutEvents(timed, date),
    [timed, date]
  );
  const firstTop = placed[0]?.top;

  // Open at the first event, or at 8am on an empty day.
  useEffect(() => {
    const minutes = firstTop === undefined ? 8 * 60 : Math.max(firstTop - 30, 0);
    if (scrollRef.current) scrollRef.current.scrollTop = minutes * pxPerMinute;
  }, [date, firstTop, pxPerMinute]);

  const nowTop = isToday(date)
    ? differenceInMinutes(new Date(), startOfDay(date))
    : null;

  return (
    <div className={cn("flex flex-col gap-3 p-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {onBack && (
          <Button onClick={onBack} size="sm" type="button" variant="ghost">
            <ArrowLeftIcon className="size-4" />
            {backLabel}
          </Button>
        )}
        <h3 className="font-medium text-sm">{format(date, "EEEE, MMMM d, yyyy")}</h3>
      </div>

      <MiniCalendar
        className="max-w-full justify-between overflow-x-auto"
        days={days}
        onStartDateChange={(next) => next && setStripStart(next)}
        onValueChange={(next) => next && onDateChange(next)}
        startDate={stripStart}
        value={date}
      >
        <MiniCalendarNavigation aria-label="Previous days" direction="prev" />
        <MiniCalendarDays>
          {(day) => <MiniCalendarDay date={day} key={day.toISOString()} />}
        </MiniCalendarDays>
        <MiniCalendarNavigation aria-label="Next days" direction="next" />
      </MiniCalendar>

      {allDay.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl border bg-card p-2 text-xs">
          {allDay.map((feature) => (
            <li className="min-w-0" key={feature.id}>
              <CalendarItem feature={feature} />
            </li>
          ))}
        </ul>
      )}

      {placed.length === 0 && allDay.length === 0 && (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      )}

      <div
        className="h-96 overflow-y-auto rounded-xl border bg-card"
        ref={scrollRef}
        tabIndex={0}
      >
        <div
          className="relative"
          style={{ height: (MINUTES_IN_DAY * hourHeight) / 60 }}
        >
          {HOURS.map((hour) => (
            <div
              className="absolute inset-x-0 border-t pl-2 text-muted-foreground text-xs tabular-nums"
              key={hour}
              style={{ top: hour * hourHeight }}
            >
              {format(new Date(2024, 0, 1, hour), "HH:mm")}
            </div>
          ))}
          <ul className="absolute inset-y-0 right-1 left-14">
            {placed.map(({ feature, top, bottom, lane }) => (
              <li
                className="absolute overflow-hidden rounded-md border-l-4 bg-secondary px-2 py-1 text-secondary-foreground text-xs"
                key={feature.id}
                style={{
                  top: top * pxPerMinute,
                  height: (bottom - top) * pxPerMinute - 2,
                  left: `${(lane / lanes) * 100}%`,
                  width: `calc(${100 / lanes}% - 2px)`,
                  borderLeftColor: feature.status.color,
                }}
              >
                {renderEvent ? (
                  renderEvent(feature)
                ) : (
                  <>
                    <p className="truncate font-medium">{feature.name}</p>
                    <p className="truncate text-muted-foreground tabular-nums">
                      {isSameDay(feature.startAt, date)
                        ? format(feature.startAt, "HH:mm")
                        : "…"}
                      {" – "}
                      {isSameDay(feature.endAt, date)
                        ? format(feature.endAt, "HH:mm")
                        : "…"}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
          {nowTop !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-destructive border-t-2"
              style={{ top: nowTop * pxPerMinute }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export type NewCalendarEvent = Omit<Feature, "id">;

type EventDraft = { name: string; start: string; end: string; statusId: string };

const toInput = (date: Date) => format(date, "yyyy-MM-dd");

export type CalendarEventFormProps = {
  statuses: Status[];
  initialStart?: Date;
  initialEnd?: Date;
  onSubmit: (event: NewCalendarEvent) => void;
  onCancel: () => void;
};

/** A small form for a new event spanning one or more days. */
export const CalendarEventForm = ({
  statuses,
  initialStart = new Date(),
  initialEnd = initialStart,
  onSubmit,
  onCancel,
}: CalendarEventFormProps) => {
  const [draft, setDraft] = useState<EventDraft>({
    name: "",
    start: toInput(initialStart),
    end: toInput(initialEnd),
    statusId: statuses[0]?.id ?? "",
  });
  const update = (patch: Partial<EventDraft>) => setDraft((value) => ({ ...value, ...patch }));
  const invalid = !draft.name.trim() || draft.end < draft.start;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    const status = statuses.find(({ id }) => id === draft.statusId) ?? statuses[0];
    onSubmit({
      name: draft.name.trim(),
      startAt: startOfDay(new Date(`${draft.start}T00:00`)),
      endAt: endOfDay(new Date(`${draft.end}T00:00`)),
      status,
    });
  };

  return (
    <form
      aria-label="New event"
      className="flex flex-wrap items-end gap-2 border-b p-3 text-sm"
      onSubmit={submit}
    >
      <label className="flex min-w-40 flex-1 flex-col gap-1">
        Name
        <Input
          autoFocus
          onChange={(event) => update({ name: event.target.value })}
          value={draft.name}
        />
      </label>
      <label className="flex flex-col gap-1">
        Starts
        <Input
          onChange={(event) => update({ start: event.target.value })}
          type="date"
          value={draft.start}
        />
      </label>
      <label className="flex flex-col gap-1">
        Ends
        <Input
          min={draft.start}
          onChange={(event) => update({ end: event.target.value })}
          type="date"
          value={draft.end}
        />
      </label>
      {statuses.length > 1 && (
        <label className="flex flex-col gap-1">
          Status
          <select
            className="h-9 rounded-md border bg-transparent px-2"
            onChange={(event) => update({ statusId: event.target.value })}
            value={draft.statusId}
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <Button disabled={invalid} size="sm" type="submit">
        Add event
      </Button>
      <Button onClick={onCancel} size="sm" type="button" variant="ghost">
        Cancel
      </Button>
    </form>
  );
};

export type CalendarWithDayViewProps = {
  features: Feature[];
  /** Opens directly on this day. */
  defaultDate?: Date;
  /** Shows this month when the calendar first opens. */
  defaultMonth?: Date;
  locale?: Intl.LocalesArgument;
  startDay?: number;
  yearRange?: { start: number; end: number };
  /**
   * Lets people add events by dragging across days or with the New event button.
   * The calendar keeps the new events itself and reports each one here.
   */
  onCreateEvent?: (event: Feature) => void;
  /** Statuses offered for new events. Defaults to one neutral status. */
  statuses?: Status[];
  newEventLabel?: string;
  className?: string;
};

const DEFAULT_STATUS: Status = { id: "event", name: "Event", color: "var(--chart-2)" };

/** A month calendar. Clicking a day opens the day strip and timeline; dragging across days adds an event. */
export const CalendarWithDayView = ({
  features,
  defaultDate,
  defaultMonth,
  locale,
  startDay,
  yearRange,
  onCreateEvent,
  statuses = [DEFAULT_STATUS],
  newEventLabel = "New event",
  className,
}: CalendarWithDayViewProps) => {
  const [selected, setSelected] = useState<Date | undefined>(defaultDate);
  const [added, setAdded] = useState<Feature[]>([]);
  const [draft, setDraft] = useState<{ start: Date; end: Date } | null>(null);
  const [, setMonth] = useCalendarMonth();
  const [, setYear] = useCalendarYear();
  const thisYear = new Date().getFullYear();
  const allFeatures = useMemo(() => [...features, ...added], [features, added]);

  const showMonthOf = (date: Date) => {
    setMonth(date.getMonth() as CalendarState["month"]);
    setYear(date.getFullYear());
  };

  useEffect(() => {
    const initial = defaultDate ?? defaultMonth;
    if (initial) showMonthOf(initial);
    // Only applies on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = (event: NewCalendarEvent) => {
    const feature = { id: `event-${Date.now()}`, ...event };
    setAdded((value) => [...value, feature]);
    onCreateEvent?.(feature);
    setDraft(null);
  };

  if (selected) {
    return (
      <CalendarDayView
        className={className}
        date={selected}
        features={allFeatures}
        onBack={() => {
          showMonthOf(selected);
          setSelected(undefined);
        }}
        onDateChange={setSelected}
      />
    );
  }

  return (
    <CalendarProvider className={className} locale={locale} startDay={startDay}>
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker
            end={yearRange?.end ?? thisYear + 5}
            start={yearRange?.start ?? thisYear - 5}
          />
        </CalendarDatePicker>
        <div className="flex items-center gap-2">
          {onCreateEvent && !draft && (
            <Button
              onClick={() => setDraft({ start: new Date(), end: new Date() })}
              size="sm"
              type="button"
              variant="outline"
            >
              <PlusIcon />
              {newEventLabel}
            </Button>
          )}
          <CalendarDatePagination />
        </div>
      </CalendarDate>
      {draft && (
        <CalendarEventForm
          initialEnd={draft.end}
          initialStart={draft.start}
          onCancel={() => setDraft(null)}
          onSubmit={create}
          statuses={statuses}
        />
      )}
      <CalendarHeader />
      <CalendarBody
        features={allFeatures}
        onDaySelect={setSelected}
        onRangeSelect={onCreateEvent ? (start, end) => setDraft({ start, end }) : undefined}
      >
        {({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
      </CalendarBody>
    </CalendarProvider>
  );
};
