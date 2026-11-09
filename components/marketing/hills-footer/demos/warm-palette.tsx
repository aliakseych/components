import { HillsFooter } from "../index";

export default function Demo() {
  return (
    <HillsFooter
      className="-m-8 w-[calc(100%+4rem)]"
      headline="Rest well, then come back to the hills."
      accent="come back"
      intro="Set the scene colours with theme tokens."
      cta={{ label: "Book a visit", href: "#" }}
      colors={{
        sky: "var(--chart-3)",
        sun: "var(--chart-1)",
        hills: ["var(--chart-1)", "var(--chart-1)", "var(--chart-5)", "var(--chart-5)"],
      }}
      columns={[
        { title: "Visit", links: [{ label: "Hours", href: "#" }, { label: "Location", href: "#" }] },
        { title: "Help", links: [{ label: "FAQ", href: "#" }, { label: "Contact", href: "#" }] },
      ]}
      onSubscribe={() => {}}
    />
  );
}
