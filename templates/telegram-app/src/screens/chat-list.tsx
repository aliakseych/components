import { BellOffIcon, CheckCheckIcon, PencilIcon, PinIcon, SearchIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { TabBar } from "@/components/tab-bar";
import { config } from "@/template.config";
import { cn } from "@/lib/utils";
import { useRouter } from "@/lib/router";
import { type Chat, chats, folders, preview } from "@/sample/data";

function ChatRow({ chat }: { chat: Chat }) {
  const { go } = useRouter();
  const last = chat.messages[chat.messages.length - 1];
  const mine = last?.from === "me";
  return (
    <li>
      <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left outline-none active:bg-muted focus-visible:bg-muted" onClick={() => go(`/chats/${chat.id}`)} type="button">
        <Avatar hue={chat.hue} name={chat.title} online={chat.online} />
        <span className="min-w-0 flex-1 border-b pb-2.5">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{chat.title}</span>
            {chat.muted && <BellOffIcon className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className="ml-auto flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
              {mine && <CheckCheckIcon className={cn("size-4", last.read && "text-accent")} />}
              {last?.time}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span className="line-clamp-2 min-w-0 flex-1 text-muted-foreground text-sm">
              {chat.group && last?.from !== "me" && last?.kind !== "service" && chat.members?.[last.from] ? <span className="text-foreground">{chat.members[last.from].name.split(" ")[0]}: </span> : null}
              {preview(chat)}
            </span>
            {chat.pinned && !chat.unread && <PinIcon className="size-4 shrink-0 rotate-45 text-muted-foreground" />}
            {chat.unread > 0 && (
              <span className={cn("min-w-5 shrink-0 rounded-full px-1.5 text-center text-white text-xs leading-5", chat.muted ? "bg-badge-muted" : "bg-badge")}>{chat.unread}</span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

export function ChatList() {
  const { params, go } = useRouter();
  const folder = params.get("folder") ?? "all";
  const visible = chats
    .filter((c) => (folder === "all" ? true : folder === "unread" ? c.unread > 0 : c.folders.includes(folder)))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const total = chats.reduce((n, c) => n + (c.muted ? 0 : c.unread), 0);

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 bg-header">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="font-semibold text-xl">{config.name}</h1>
          <button aria-label="Search" className="rounded-full p-2 text-muted-foreground" type="button">
            <SearchIcon className="size-5" />
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-2 [scrollbar-width:none]" role="tablist">
          {folders.map((f) => {
            const count = f.id === "all" ? 0 : chats.filter((c) => (f.id === "unread" ? false : c.folders.includes(f.id))).reduce((n, c) => n + c.unread, 0);
            const active = f.id === folder;
            return (
              <button
                aria-selected={active}
                className={cn("relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 font-medium text-sm", active ? "text-accent" : "text-muted-foreground")}
                key={f.id}
                onClick={() => go(f.id === "all" ? "/" : `/?folder=${f.id}`)}
                role="tab"
                type="button"
              >
                {f.title}
                {count > 0 && <span className="rounded-full bg-badge px-1.5 text-[11px] text-white leading-4">{count}</span>}
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto border-t">{visible.map((c) => <ChatRow chat={c} key={c.id} />)}</ul>
      <button aria-label="New message" className="absolute right-4 bottom-20 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg" type="button">
        <PencilIcon className="size-6" />
      </button>
      <TabBar unread={total} />
    </div>
  );
}
