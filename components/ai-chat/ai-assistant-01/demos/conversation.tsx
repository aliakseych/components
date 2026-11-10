import { AiAssistant1, aiAssistant1ExampleProps } from "../index";
import { seededMessages, useDemoChat } from "../../ai-assistant-01/demos/demo-chat";

const messages = seededMessages("Why did the numbers move this week?", [
  "Three things explain most of the movement:\n\n1. **A pricing change** on Tuesday shifted new sign-ups toward the cheaper plan.\n2. **A slow checkout page** after Wednesday's deploy cost roughly 4% of conversions.\n3. **Seasonal demand** lifted traffic by about 6% compared with last week.",
  "I can break any of these down further if you'd like.",
]);

export default function Demo() {
  return (
    <div className="h-[640px] w-full max-w-3xl">
      <AiAssistant1 {...aiAssistant1ExampleProps} chat={useDemoChat(messages)} />
    </div>
  );
}
