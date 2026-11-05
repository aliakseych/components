import { Changelog } from "../index";

const entries = [
  {
    version: "Version 1.3.0",
    date: "15 November 2026",
    title: "A redesigned analytics dashboard",
    description: "See your data more clearly, with new charts and filters.",
    items: ["Live chart updates", "Custom dashboard widgets", "CSV and PDF export"],
    button: { url: "#analytics", text: "Learn more" },
  },
  {
    version: "Version 1.2.0",
    date: "7 October 2026",
    title: "Mobile app launch",
    description: "The app is now available on iOS and Android.",
    items: ["Offline mode", "Push notifications"],
  },
];

export default function Demo() {
  return (
    <Changelog
      className="py-4"
      description="The latest updates to the product."
      entries={entries}
    />
  );
}
