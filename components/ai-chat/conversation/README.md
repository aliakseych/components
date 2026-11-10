# Conversation

The turns of an AI chat. People's messages are right-aligned bubbles; the assistant's replies are open text beside a small mark, so long answers, tables and code read comfortably. Self-contained; for person-to-person chat use the `messaging` category.

```tsx
import { Conversation } from "./conversation";

<Conversation busy={isLoading} onCopy={copy} onFeedback={rate} onRegenerate={retry} turns={turns} />;
```

Each turn has `id`, `role` (`user` or `assistant`), `content` (text or any element), and optional `footer`, `error` and `activity` (tool calls or reasoning shown above the reply). Action buttons appear when you pass `onCopy`, `onFeedback` or `onRegenerate`.

## Origin

Written for this library, following the ai-elements and shadcn chat patterns.
