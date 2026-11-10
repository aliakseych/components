import { ChatScreen } from "../index";

export default function Demo() {
  return (
    <div className="h-[640px] w-full max-w-3xl overflow-hidden rounded-xl border">
      <ChatScreen
        emptyDescription="Ask a question or pick a starter."
        onSend={() => {}}
        suggestions={[
          "Explain this error message",
          "Draft a release note from my commits",
          "Compare two database designs",
        ]}
        title="New chat"
        turns={[]}
      />
    </div>
  );
}
