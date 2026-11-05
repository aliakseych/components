import { CalendarWithDayView } from "../index";
import { sampleEvents } from "./sample-events";

export default function Demo() {
  return (
    <div className="w-full max-w-2xl rounded-lg border">
      <CalendarWithDayView defaultDate={new Date()} features={sampleEvents} />
    </div>
  );
}
