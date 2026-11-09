import { DisplayCards, DotGridBackdrop, type DisplayCardItem } from "../index";

const cards: DisplayCardItem[] = [
  {
    title: "Usage alert",
    description: "Storage passed 80 percent of the plan on the main workspace.",
    date: "Yesterday",
  },
  {
    title: "Review requested",
    description: "Priya asked for a second look at the billing export before Friday.",
    date: "2 hours ago",
  },
  {
    title: "New release",
    description: "Dark mode, faster search and a redesigned settings page are live.",
    date: "Today",
  },
];

export default function Demo() {
  return (
    <div className="relative isolate flex min-h-80 w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      <DotGridBackdrop />
      <DisplayCards cards={cards} />
    </div>
  );
}
