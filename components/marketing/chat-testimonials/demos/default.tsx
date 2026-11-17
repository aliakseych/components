import { ChatTestimonials } from "../index";

const items = [
  { quote: "“Relay flagged a duplicate charge nobody had noticed. It had been costing us about $900 each month.”", author: "Ana Duarte · Operations Owner", company: "Northline Freight" },
  { quote: "“Every answer links back to its source, so I never have to wonder where it came from.”", author: "Sam Okafor · Operations Owner", company: "Okafor Haulage" },
  { quote: "“Status calls used to eat my mornings. Now a short digest covers it in a few minutes.”", author: "Jay · Operations Owner", company: "Bluebird Logistics" },
  { quote: "“When two documents disagree, Relay points me straight at the lines to compare.”", author: "Rita Ferris · Operations Owner", company: "Ferris & Co" },
];

export default function Demo() {
  return <ChatTestimonials title="How teams work once Relay joins." items={items} ariaLabel="Owner testimonials" />;
}
