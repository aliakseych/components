import { addDays } from "date-fns";
import { Roadmap, type RoadmapFeature } from "../index";

const today = new Date();
const statuses = [
  { id: "planned", name: "Planned", color: "var(--chart-2)" },
  { id: "active", name: "In Progress", color: "var(--chart-3)" },
  { id: "done", name: "Done", color: "var(--chart-4)" },
];
const growth = { id: "growth", name: "Growth" };
const platform = { id: "platform", name: "Platform" };

const features: RoadmapFeature[] = [
  { id: "pricing", name: "Pricing experiment", startAt: addDays(today, -3), endAt: addDays(today, 4), status: statuses[1], group: growth },
  { id: "search", name: "Faster search", startAt: addDays(today, -1), endAt: addDays(today, 9), status: statuses[0], group: platform },
  { id: "signup", name: "New signup flow", startAt: addDays(today, -9), endAt: addDays(today, -4), status: statuses[2], group: growth },
];

export default function Demo() {
  return (
    <div className="h-[40rem] w-full overflow-auto rounded-xl border bg-card shadow-xs">
      <Roadmap defaultFeatures={features} defaultView="calendar" statuses={statuses} />
    </div>
  );
}
