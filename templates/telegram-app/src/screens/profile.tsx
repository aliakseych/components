import { ArrowLeftIcon, BellIcon, MessageCircleIcon, PhoneIcon, SearchIcon, VideoIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useRouter } from "@/lib/router";
import { chats, sharedMedia } from "@/sample/data";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="px-4 py-2.5">
      <p>{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

export function Profile({ id }: { id: string }) {
  const { back } = useRouter();
  const chat = chats.find((c) => c.id === id);
  if (!chat) return null;
  const actions = [
    { Icon: MessageCircleIcon, label: "Message" },
    { Icon: PhoneIcon, label: "Call" },
    { Icon: VideoIcon, label: "Video" },
    { Icon: chat.muted ? BellIcon : SearchIcon, label: chat.muted ? "Unmute" : "Search" },
  ];
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-muted">
      <header className="flex flex-col items-center bg-background pb-4">
        <div className="flex h-14 w-full items-center px-1">
          <button aria-label="Back" className="rounded-full p-2.5 text-accent" onClick={back} type="button">
            <ArrowLeftIcon className="size-5" />
          </button>
        </div>
        <Avatar hue={chat.hue} name={chat.title} size={96} />
        <h1 className="mt-3 font-semibold text-xl">{chat.title}</h1>
        <p className="text-muted-foreground text-sm">{chat.status}</p>
        <div className="mt-4 grid w-full grid-cols-4 gap-2 px-4">
          {actions.map(({ Icon, label }) => (
            <button className="flex flex-col items-center gap-1 rounded-xl bg-muted py-2.5 text-accent text-xs" key={label} type="button">
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </header>
      <section className="mt-2 divide-y bg-background">
        <Row label="Phone" value={chat.phone} />
        <Row label="Username" value={chat.username} />
        <Row label="Bio" value={chat.bio} />
        {chat.members && <Row label="Members" value={`${Object.keys(chat.members).length + 1} in this group`} />}
      </section>
      <section className="mt-2 bg-background pb-4">
        <h2 className="px-4 pt-3 pb-2 font-medium text-accent text-sm">Shared media</h2>
        <div className="grid grid-cols-3 gap-0.5">
          {sharedMedia.map((h) => (
            <div className="aspect-square" key={h} style={{ backgroundImage: `linear-gradient(135deg, oklch(0.8 0.1 ${h}), oklch(0.62 0.15 ${h + 50}))` }} />
          ))}
        </div>
      </section>
    </div>
  );
}
