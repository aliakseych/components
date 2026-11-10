import { MessageCircleIcon, SettingsIcon } from "lucide-react";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Chats", Icon: MessageCircleIcon },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
] as const;

/** Bottom navigation for the two root screens. */
export function TabBar({ unread }: { unread: number }) {
  const { path, go } = useRouter();
  return (
    <nav aria-label="Main" className="flex h-16 shrink-0 border-t bg-header pb-1">
      {tabs.map(({ to, label, Icon }) => {
        const active = path === to;
        return (
          <button
            aria-current={active ? "page" : undefined}
            className={cn("relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] outline-none focus-visible:bg-muted", active ? "text-accent" : "text-muted-foreground")}
            key={to}
            onClick={() => go(to)}
            type="button"
          >
            <span className="relative">
              <Icon className="size-6" />
              {to === "/" && unread > 0 && (
                <span className="absolute -top-1 left-3.5 rounded-full bg-badge px-1.5 text-[10px] text-white leading-4">{unread}</span>
              )}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

