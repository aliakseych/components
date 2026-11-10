# Chat Screen

A full-height AI chat: header, conversation, composer. It is controlled: you own `turns`, `busy` and the send handler, so it works with any model or stream.

```tsx
<div className="h-dvh">
  <ChatScreen busy={busy} onSend={send} suggestions={starters} title="Assistant" turns={turns} />
</div>
```

The parent must give it a height. The empty state shows `suggestions`; clicking one calls `onSend`.

## Origin

Written for this library. Install `ai-chat/conversation` and `ai-chat/chat-composer` with it.
