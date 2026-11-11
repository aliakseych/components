import { useState } from "react";
import { Briefcase, Heart, Landmark, Wallet, Home, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderCard, FolderCardGrid } from "../index";
import emblem from "./emblem.webp";

const chips = ["All", "Entrepreneurs", "Family", "Finance", "Housing", "Employment", "Courts", "Taxes"];
const items = [
  { title: "Tax Code", icon: Wallet, views: 20412, chip: "Taxes" },
  { title: "Labour Code", icon: Briefcase, views: 17300, chip: "Employment" },
  { title: "Family Code", icon: Heart, views: 27415, chip: "Family" },
  { title: "Housing Code", icon: Home, views: 11860, chip: "Housing" },
  { title: "Code of Civil Procedure", icon: Scale, views: 31842, chip: "Courts" },
  { title: "Constitution", icon: Landmark, views: 48210, chip: "All" },
];

export default function Demo() {
  const [active, setActive] = useState("All");
  const shown = items.filter((i) => active === "All" || i.chip === active);
  return (
    <div className="w-full max-w-4xl space-y-4 p-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            onClick={() => setActive(c)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <FolderCardGrid key={active}>
        {shown.map(({ chip: _c, ...i }) => (
          <FolderCard key={i.title} {...i} watermark={emblem} href="#" />
        ))}
      </FolderCardGrid>
    </div>
  );
}
