import { ArrowLeftIcon, CheckCheckIcon, CheckIcon, MicIcon, MoreVerticalIcon, PaperclipIcon, PlayIcon, SendIcon, SmileIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";
import { type Chat, chats, type Message } from "@/sample/data";

const quickReactions = ["👍", "❤️", "🔥", "😂"];
const bars = [4, 9, 6, 12, 8, 14, 7, 10, 5, 13, 9, 6, 11, 4, 8, 12, 6, 9];

function senderOf(chat: Chat, from: string) {
  return chat.members?.[from]?.name ?? (from === "me" ? "You" : chat.title);
}

function Meta({ m }: { m: Message }) {
  return (
    <span className="float-right mt-1.5 ml-3 inline-flex items-center gap-0.5 text-[11px] opacity-70">
      {m.time}
      {m.from === "me" && (m.read ? <CheckCheckIcon className="size-3.5 text-accent" /> : <CheckIcon className="size-3.5" />)}
    </span>
  );
}

function Bubble({ chat, m, onReact, quoted }: { chat: Chat; m: Message; onReact: (emoji: string) => void; quoted?: Message }) {
  const mine = m.from === "me";
  const name = chat.group && !mine ? chat.members?.[m.from] : undefined;
  let body: ReactNode = (
    <p className="whitespace-pre-wrap break-words">
      {m.text}
      <Meta m={m} />
    </p>
  );
  if (m.kind === "voice") {
    body = (
      <div className="flex min-w-48 items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <PlayIcon className="size-5 fill-current" />
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="flex h-4 items-center gap-0.5">
            {bars.map((h, i) => (
              <span className="w-0.5 rounded-full bg-accent/60" key={i} style={{ height: h }} />
            ))}
          </span>
          <span className="text-[11px] opacity-70">0:{String(m.seconds).padStart(2, "0")}</span>
        </span>
        <span className="self-end"><Meta m={m} /></span>
      </div>
    );
  } else if (m.kind === "photo") {
    body = (
      <div className="relative -mx-2.5 -my-1.5 h-44 w-60 overflow-hidden rounded-xl" style={{ backgroundImage: "linear-gradient(135deg, oklch(0.8 0.1 60), oklch(0.62 0.15 330))" }}>
        <span className="absolute right-2 bottom-2 rounded-full bg-black/40 px-2 text-[11px] text-white leading-5">{m.time}</span>
      </div>
    );
  }
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start", m.reactions && "mb-0.5")}>
      <div className={cn("max-w-[80%] rounded-2xl px-2.5 py-1.5 text-[15px] leading-snug shadow-sm", mine ? "rounded-br-md bg-out text-out-foreground" : "rounded-bl-md bg-in")}>
        {name && <p className="font-medium text-[13px]" style={{ color: `oklch(0.6 0.16 ${chat.members?.[m.from]?.hue})` }}>{name.name}</p>}
        {quoted && (
          <div className="mb-1 rounded-md border-accent border-l-2 bg-accent/10 py-0.5 pr-2 pl-2 text-[13px]">
            <p className="font-medium text-accent">{senderOf(chat, quoted.from)}</p>
            <p className="line-clamp-1 opacity-80">{quoted.text ?? (quoted.kind === "voice" ? "Voice message" : "Photo")}</p>
          </div>
        )}
        {body}
        <span className="clear-both block" />
        {m.reactions && (
          <div className="mt-1 flex flex-wrap gap-1">
            {m.reactions.map((r) => (
              <button
                aria-pressed={!!r.mine}
                className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs", r.mine ? "bg-accent text-accent-foreground" : "bg-accent/15 text-foreground")}
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                type="button"
              >
                {r.emoji} {r.count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatScreen({ id }: { id: string }) {
  const { back, go } = useRouter();
  const chat = chats.find((c) => c.id === id);
  const [messages, setMessages] = useState<Message[]>(chat?.messages ?? []);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);
  if (!chat) return <p className="p-6 text-muted-foreground">Chat not found.</p>;

  const react = (mid: string, emoji: string) =>
    setMessages((all) =>
      all.map((m) => {
        if (m.id !== mid) return m;
        const list = m.reactions ?? [];
        const hit = list.find((r) => r.emoji === emoji);
        if (!hit) return { ...m, reactions: [...list, { emoji, count: 1, mine: true }] };
        const next = hit.mine ? { ...hit, count: hit.count - 1, mine: false } : { ...hit, count: hit.count + 1, mine: true };
        return { ...m, reactions: list.map((r) => (r === hit ? next : r)).filter((r) => r.count > 0) };
      }),
    );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((all) => [...all, { id: `s${all.length}`, from: "me", kind: "text", text, time: "now", replyTo: replyTo?.id }]);
    setDraft("");
    setReplyTo(null);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b bg-header pr-2 pl-1">
        <button aria-label="Back" className="rounded-full p-2.5 text-accent" onClick={back} type="button">
          <ArrowLeftIcon className="size-5" />
        </button>
        <button className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => go(`/chats/${chat.id}/info`)} type="button">
          <Avatar hue={chat.hue} name={chat.title} size={38} />
          <span className="min-w-0">
            <span className="block truncate font-medium leading-tight">{chat.title}</span>
            <span className={cn("block truncate text-xs", chat.online ? "text-accent" : "text-muted-foreground")}>{chat.status}</span>
          </span>
        </button>
        <button aria-label="More" className="rounded-full p-2.5 text-muted-foreground" type="button">
          <MoreVerticalIcon className="size-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-wallpaper px-3 py-3">
        {messages.map((m) => (
          <div className="contents" key={m.id}>
            {m.day && <p className="my-2 self-center rounded-full bg-black/20 px-2.5 py-0.5 font-medium text-white text-xs dark:bg-white/10">{m.day}</p>}
            {m.kind === "service" ? (
              <p className="self-center rounded-full bg-black/20 px-2.5 py-0.5 text-white text-xs dark:bg-white/10">{m.text}</p>
            ) : (
              <div onDoubleClick={() => react(m.id, "👍")} onClick={() => setReplyTo(m)} role="presentation">
                <Bubble chat={chat} m={m} onReact={(e) => react(m.id, e)} quoted={messages.find((x) => x.id === m.replyTo)} />
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>

      <footer className="shrink-0 border-t bg-header">
        {replyTo && (
          <div className="flex items-center gap-2 border-b px-4 py-1.5 text-sm">
            <span className="h-8 w-0.5 rounded-full bg-accent" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-accent text-xs">Reply to {senderOf(chat, replyTo.from)}</span>
              <span className="block truncate text-muted-foreground">{replyTo.text ?? "Media"}</span>
            </span>
            <span className="flex gap-1">{quickReactions.map((e) => <button className="rounded-full p-1 text-base" key={e} onClick={() => { react(replyTo.id, e); setReplyTo(null); }} type="button">{e}</button>)}</span>
            <button aria-label="Cancel reply" className="px-1 text-muted-foreground" onClick={() => setReplyTo(null)} type="button">✕</button>
          </div>
        )}
        <form className="flex items-center gap-1 px-2 py-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <SmileIcon className="mx-2 size-6 shrink-0 text-muted-foreground" />
          <input aria-label="Message" className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted-foreground" onChange={(e) => setDraft(e.target.value)} placeholder="Message" value={draft} />
          {draft.trim() ? (
            <button aria-label="Send" className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground" type="submit">
              <SendIcon className="size-5" />
            </button>
          ) : (
            <>
              <PaperclipIcon className="mx-2 size-6 shrink-0 text-muted-foreground" />
              <MicIcon className="mx-2 size-6 shrink-0 text-muted-foreground" />
            </>
          )}
        </form>
      </footer>
    </div>
  );
}
