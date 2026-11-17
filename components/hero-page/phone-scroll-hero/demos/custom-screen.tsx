import { CheckCircle2, Clock, Truck } from "lucide-react";
import { PhoneScrollHero } from "../index";

const loads = [
  { id: "5521", lane: "Dallas → Memphis", status: "Delivered", done: true },
  { id: "5524", lane: "Austin → Tulsa", status: "In transit", done: false },
  { id: "5530", lane: "Houston → Atlanta", status: "Delivered", done: true },
  { id: "5533", lane: "El Paso → Phoenix", status: "Loading", done: false },
  { id: "5538", lane: "Laredo → Denver", status: "In transit", done: false },
  { id: "5541", lane: "Waco → Little Rock", status: "Delivered", done: true },
];

/** A simple loads list drawn at the phone's 402 by 876 design size. */
function LoadsScreen() {
  return (
    <div className="h-[876px] w-[402px] bg-background px-4 pt-[70px] text-foreground">
      <h3 className="text-[32px] font-bold tracking-tight">Loads</h3>
      <p className="text-[15px] text-muted-foreground">Today, 6 active</p>
      <ul className="mt-5 divide-y rounded-3xl border bg-card">
        {loads.map((load) => (
          <li key={load.id} className="flex items-center gap-3 p-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted">
              <Truck className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[17px] font-semibold">{load.lane}</span>
              <span className="text-[14px] text-muted-foreground">Load {load.id}</span>
            </span>
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              {load.done ? <CheckCircle2 className="size-4 text-primary" /> : <Clock className="size-4" />}
              {load.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The hero scrolls inside its own frame, so the demo stays one screen tall.
export default function Demo() {
  return (
    <div
      className="h-[calc(100svh-4rem)] w-full overflow-y-auto bg-background"
      tabIndex={0}
      role="region"
      aria-label="Scrollable hero demo"
    >
      <div>
        <PhoneScrollHero headerOffset={0} title="Every load, in one place" description="Track every truck from pickup to delivery.">
          <LoadsScreen />
        </PhoneScrollHero>
        <div className="h-[60svh]" />
      </div>
    </div>
  );
}
