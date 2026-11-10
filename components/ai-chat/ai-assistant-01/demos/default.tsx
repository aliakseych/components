import { AiAssistant1, aiAssistant1ExampleProps } from "../index";
import { useDemoChat } from "./demo-chat";

export default function Demo() {
  return (
    <div className="h-[640px] w-full max-w-3xl">
      <AiAssistant1 {...aiAssistant1ExampleProps} chat={useDemoChat()} />
    </div>
  );
}
