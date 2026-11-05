# AI Assistant: Side Panel

An assistant docked beside the page, with suggested prompts, the page as context, and New conversation and Close buttons.

```tsx
import { AiAssistant1, aiAssistant1ExampleProps } from "./ai-assistant-01";

<AiAssistant1 {...aiAssistant1ExampleProps} />;
```

`aiAssistant1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiAssistant1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-assistant-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/ai-assistant/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-assistant) (MIT).
