import { CalendarWithDayView } from "../index";
import { sampleEvents } from "./sample-events";

const statuses = [
  { id: "planned", name: "Planned", color: "var(--chart-2)" },
  { id: "review", name: "Review", color: "var(--chart-3)" },
];

export default function Demo() {
  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border bg-card shadow-xs">
      <CalendarWithDayView
        defaultMonth={new Date()}
        features={sampleEvents}
        onCreateEvent={() => {}}
        statuses={statuses}
      />
    </div>
  );
}
