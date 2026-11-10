import { ChatComposer } from "../index";

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <ChatComposer
        hint="The assistant can make mistakes. Check important information."
        onAttach={() => {}}
        onSend={() => {}}
        placeholder="Message the assistant"
      />
    </div>
  );
}
