import { AiAssistant4, aiAssistant4ExampleProps } from "../index";
import { useDemoChat } from "../../ai-assistant-01/demos/demo-chat";

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <AiAssistant4 {...aiAssistant4ExampleProps} chat={useDemoChat()} />
    </div>
  );
}
