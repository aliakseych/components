import { Feature } from "../index";

const image = (from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#a)"/></svg>`
  )}`;

const features = [
  {
    id: "reports",
    title: "Automatic reports",
    description: "Get a clear summary of your week, delivered every Monday.",
    image: image("#38bdf8", "#6366f1"),
  },
  {
    id: "sharing",
    title: "Simple sharing",
    description: "Invite your team and choose exactly what each person can see.",
    image: image("#f472b6", "#f59e0b"),
  },
  {
    id: "security",
    title: "Built-in security",
    description: "Single sign-on and audit logs are included on every plan.",
    image: image("#34d399", "#0ea5e9"),
  },
];

export default function Demo() {
  return <Feature className="py-4" features={features} />;
}
