import { ChatComposer } from "../index";

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <ChatComposer busy onSend={() => {}} onStop={() => {}} placeholder="Message the assistant" />
    </div>
  );
}
