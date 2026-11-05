import { addDays, addHours, startOfDay } from "date-fns";

const day = startOfDay(new Date());
const planned = { id: "planned", name: "Planned", color: "#3B82F6" };
const review = { id: "review", name: "Review", color: "#F59E0B" };
const done = { id: "done", name: "Done", color: "#10B981" };

export const sampleEvents = [
  { id: "standup", name: "Team standup", startAt: addHours(day, 9), endAt: addHours(day, 10), status: done },
  { id: "design", name: "Design review", startAt: addHours(day, 9.5), endAt: addHours(day, 11), status: review },
  { id: "launch", name: "Launch planning", startAt: addHours(day, 13), endAt: addHours(day, 15), status: planned },
  { id: "offsite", name: "Team offsite", startAt: addDays(day, -1), endAt: addDays(day, 2), status: planned },
  { id: "demo", name: "Customer demo", startAt: addHours(addDays(day, 3), 11), endAt: addHours(addDays(day, 3), 12), status: review },
];
