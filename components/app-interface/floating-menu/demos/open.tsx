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
      <div aria-hidden="true" className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded-full bg-white/15" />
          <div className="flex gap-3">
            <div className="h-3 w-12 rounded-full bg-white/15" />
            <div className="h-3 w-12 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 pt-6">
          <div className="h-6 w-3/4 rounded-full bg-white/15" />
          <div className="h-6 w-1/2 rounded-full bg-white/15" />
          <div className="mt-3 h-2.5 w-full rounded-full bg-white/10" />
          <div className="h-2.5 w-5/6 rounded-full bg-white/10" />
          <div className="h-2.5 w-2/3 rounded-full bg-white/10" />
        </div>
      </div>
      <FloatingMenu items={items} label="Menu" defaultOpen />
    </div>
  );
}
