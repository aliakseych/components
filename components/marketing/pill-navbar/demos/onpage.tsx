import { PillNavbar } from "../index";
import { actions, brand, brandMenu, items, tools } from "./default";

const sections = [
  { id: "pn-overview", title: "Overview" },
  { id: "pn-features", title: "Features for wireframing" },
  { id: "pn-ai", title: "AI assistant" },
  { id: "pn-pricing", title: "Pricing" },
];

export default function Demo() {
  return (
    <div className="w-full bg-muted/40 pt-4">
      <PillNavbar
        brand={brand}
        items={items}
        actions={actions}
        brandMenu={brandMenu}
        tools={tools}
        sections={sections}
        defaultFolded
        className="sticky top-3 z-50"
      />
      <div className="mx-auto max-w-2xl px-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="min-h-[70vh] border-b py-16">
            <h2 className="text-2xl font-semibold">{s.title}</h2>
            <p className="mt-3 text-muted-foreground">Scroll to see the bar track the current section.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
