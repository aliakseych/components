# AI Assistant: Ask About Data

Questions about this month's [AI Usage](/docs/blocks/ai-usage) numbers, with the tokens and cost of each answer and a change that waits for your approval.

```tsx
import { AiAssistant3, aiAssistant3ExampleProps } from "./ai-assistant-03";

<AiAssistant3 {...aiAssistant3ExampleProps} />;
```

`aiAssistant3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiAssistant3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-assistant-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/ai-assistant/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-assistant) (MIT).
