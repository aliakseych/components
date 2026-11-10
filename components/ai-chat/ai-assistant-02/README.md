# AI Assistant: Conversation

A conversation with a table and a SQL query, where you can attach a file, copy, rate or regenerate a reply, or pick a follow-up question.

```tsx
import { AiAssistant2, aiAssistant2ExampleProps } from "./ai-assistant-02";

<AiAssistant2 {...aiAssistant2ExampleProps} />;
```

`aiAssistant2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiAssistant2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-assistant-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The block source is this folder's `index.tsx`; the shared chat parts it builds on live in `components/dashboardblocks/ai-assistant.tsx`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-assistant) (MIT).
