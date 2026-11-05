import { AiAssistant2, aiAssistant2ExampleProps } from "../index";
import { useDemoChat } from "../../ai-assistant-01/demos/demo-chat";

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <AiAssistant2 {...aiAssistant2ExampleProps} chat={useDemoChat()} />
    </div>
  );
}
