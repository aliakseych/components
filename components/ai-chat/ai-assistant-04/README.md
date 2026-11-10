# AI Assistant: Retry

A reply that failed, kept in the conversation with a button to try again.

```tsx
import { AiAssistant4, aiAssistant4ExampleProps } from "./ai-assistant-04";

<AiAssistant4 {...aiAssistant4ExampleProps} />;
```

`aiAssistant4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiAssistant4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-assistant-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The block source is this folder's `index.tsx`; the shared chat parts it builds on live in `components/dashboardblocks/ai-assistant.tsx`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-assistant) (MIT).
