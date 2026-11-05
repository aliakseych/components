import { addDays } from "date-fns";
import { Roadmap, type RoadmapFeature } from "../index";

const today = new Date();
const statuses = [
  { id: "planned", name: "Planned", color: "var(--chart-2)" },
  { id: "active", name: "In Progress", color: "var(--chart-3)" },
  { id: "done", name: "Done", color: "var(--chart-4)" },
];
const owner = { id: "sam", name: "Sam Lee" };
const growth = { id: "growth", name: "Growth" };
const platform = { id: "platform", name: "Platform" };
const product = { id: "app", name: "Web app" };

const features: RoadmapFeature[] = [
  { id: "signup", name: "New signup flow", startAt: addDays(today, -30), endAt: addDays(today, -4), status: statuses[2], owner, group: growth, product },
  { id: "pricing", name: "Pricing experiment", startAt: addDays(today, -6), endAt: addDays(today, 18), status: statuses[1], owner, group: growth, product },
  { id: "search", name: "Faster search", startAt: addDays(today, -12), endAt: addDays(today, 24), status: statuses[1], owner, group: platform, product },
  { id: "api", name: "Public API", startAt: addDays(today, 12), endAt: addDays(today, 60), status: statuses[0], owner, group: platform, product },
];

export default function Demo() {
  return (
    <div className="h-[32rem] w-full overflow-auto rounded-lg border">
      <Roadmap defaultFeatures={features} statuses={statuses} />
    </div>
  );
}
