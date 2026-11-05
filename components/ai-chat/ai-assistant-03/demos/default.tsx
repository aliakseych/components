import { AiAssistant3, aiAssistant3ExampleProps } from "../index";
import { useDemoChat } from "../../ai-assistant-01/demos/demo-chat";

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <AiAssistant3 {...aiAssistant3ExampleProps} chat={useDemoChat()} />
    </div>
  );
}
