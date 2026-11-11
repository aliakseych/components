import { SkyFooter } from "../index";
import day1 from "./cloud-1-day.webp";
import night1 from "./cloud-1-night.webp";
import day2 from "./cloud-2-day.webp";
import night2 from "./cloud-2-night.webp";
import day3 from "./cloud-3-day.webp";
import night3 from "./cloud-3-night.webp";

export default function Demo() {
  return (
    <SkyFooter
      className="-m-8 w-[calc(100%+4rem)]"
      wordmark="Cumulus"
      clouds={[
        { day: day1, night: night1 },
        { day: day2, night: night2 },
        { day: day3, night: night3 },
      ]}
      columns={[
        { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
        { title: "Developers", links: [{ label: "Docs", href: "#" }, { label: "API reference", href: "#" }, { label: "Status", href: "#" }] },
        { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }] },
        { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
      ]}
      legal="© 2026 Cumulus Labs. Made under open skies."
    />
  );
}
