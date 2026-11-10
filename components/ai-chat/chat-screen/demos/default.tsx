import { useEffect, useRef, useState } from "react";
import type { ConversationTurn } from "@/components/ai-chat/conversation";
import { ChatScreen } from "../index";

const seed: ConversationTurn[] = [
  { id: "1", role: "user", content: "What's a good way to structure a React data-fetching hook?", footer: "09:41" },
  {
    id: "2",
    role: "assistant",
    content: (
      <>
        <p>Keep it small and give it one job. A solid shape:</p>
        <ul className="my-3 list-disc space-y-1 pl-5">
          <li>Take a key and a fetcher, return <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">data</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">error</code> and <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">isLoading</code>.</li>
          <li>Abort the request when the key changes or the component unmounts.</li>
          <li>Cache by key so two components asking for the same thing share one request.</li>
        </ul>
        <p>If you need more than that, reach for a library instead of growing the hook.</p>
      </>
    ),
    footer: "09:41",
  },
];

export default function Demo() {
  const [turns, setTurns] = useState(seed);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text: string) => {
    setTurns((t) => [...t, { id: `u${t.length}`, role: "user", content: text }]);
    setBusy(true);
    timer.current = setTimeout(() => {
      setTurns((t) => [
        ...t,
        { id: `a${t.length}`, role: "assistant", content: "This is a demo reply. Connect your model to stream a real answer here." },
      ]);
      setBusy(false);
    }, 1200);
  };

  return (
    <div className="h-[640px] w-full max-w-3xl overflow-hidden rounded-xl border">
      <ChatScreen
        busy={busy}
        composer={{ placeholder: "Message the assistant", onAttach: () => {}, hint: "The assistant can make mistakes." }}
        onCopy={() => {}}
        onFeedback={() => {}}
        onRegenerate={() => {}}
        onSend={send}
        onStop={() => setBusy(false)}
        title="Code review helper"
        turns={turns}
      />
    </div>
  );
}
