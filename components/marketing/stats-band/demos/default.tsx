import { StatsBand, type StatsBandItem } from "../index";

const items: StatsBandItem[] = [
  {
    label: "Deploys in the last 12 months",
    suffix: "M",
    value: 2.3,
    previous: 1.8,
    format: (value) => value.toFixed(1),
  },
  {
    label: "API uptime over 60 days",
    suffix: "%",
    value: 99.94,
    previous: 99.87,
    changeType: "points",
    format: (value) => value.toFixed(2),
  },
  {
    label: "Median response time",
    suffix: " ms",
    value: 38,
    previous: 52,
    goodDirection: "down",
  },
  {
    label: "Edge regions",
    value: 48,
    previous: 40,
  },
];

export default function Demo() {
  return (
    <StatsBand
      backdrop="dots"
      eyebrow="Performance"
      title="Fast, steady, and close to everyone"
      description="Measured across every region over the last twelve months."
      comparison="the year before"
      items={items}
    />
  );
}
