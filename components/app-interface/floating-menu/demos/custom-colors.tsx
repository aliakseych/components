import { Home, Layers, Settings2, Users } from "lucide-react";
import { FloatingMenu } from "../index";

const items = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Projects", href: "#projects", icon: Layers },
  { label: "Team", href: "#team", icon: Users },
  { label: "Settings", href: "#settings", icon: Settings2 },
];

export default function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl bg-linear-to-b from-neutral-700 to-neutral-950">
      <FloatingMenu
        items={items}
        label="Menu"
        defaultOpen
        colors={{ surface: "var(--chart-1)", text: "var(--background)", muted: "var(--background)" }}
      />
    </div>
  );
}
