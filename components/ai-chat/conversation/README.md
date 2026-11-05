# Conversation

The turns of an AI chat, built on the messaging `Message` and `Bubble` parts so both kinds of chat share one look.

```tsx
import { Conversation } from "./conversation";

<Conversation busy={isLoading} onCopy={copy} onRegenerate={retry} turns={turns} />;
```

Each turn has `id`, `role` (`user` or `assistant`), `content` (text or any element, such as a code block), an optional `footer` and `error`. Assistant turns get copy and regenerate buttons when you pass the handlers.

## Origin

Written for this library. Install `messaging/message` and `messaging/bubble` with it.
