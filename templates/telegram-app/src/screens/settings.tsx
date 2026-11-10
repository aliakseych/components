import { BellIcon, DatabaseIcon, GlobeIcon, LockIcon, MessageCircleIcon, MoonIcon, PaletteIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { TabBar } from "@/components/tab-bar";
import { config } from "@/template.config";

const groups = [
  [
    { Icon: BellIcon, label: "Notifications and sounds", tone: 25 },
    { Icon: LockIcon, label: "Privacy and security", tone: 260 },
    { Icon: DatabaseIcon, label: "Data and storage", tone: 150 },
  ],
  [
    { Icon: PaletteIcon, label: "Appearance", tone: 330 },
    { Icon: MoonIcon, label: "Night mode", tone: 280 },
    { Icon: MessageCircleIcon, label: "Chat folders", tone: 215 },
    { Icon: GlobeIcon, label: "Language", tone: 60 },
  ],
];

export function Settings() {
  const { me } = config;
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto bg-muted">
        <header className="flex flex-col items-center bg-background px-4 pt-8 pb-5">
          <Avatar hue={me.hue} name={me.name} size={88} />
          <h1 className="mt-3 font-semibold text-xl">{me.name}</h1>
          <p className="text-muted-foreground text-sm">{me.phone} · {me.handle}</p>
        </header>
        {groups.map((g, i) => (
          <ul className="mt-2 divide-y bg-background pl-4" key={i}>
            {g.map(({ Icon, label, tone }) => (
              <li key={label}>
                <button className="flex w-full items-center gap-4 py-2.5 pr-4 text-left" type="button">
                  <span className="flex size-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: `oklch(0.65 0.15 ${tone})` }}>
                    <Icon className="size-[18px]" />
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <TabBar unread={0} />
    </div>
  );
}
