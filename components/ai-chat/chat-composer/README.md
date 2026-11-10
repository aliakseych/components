# Chat Composer

A compact AI chat input. The textarea grows up to a limit; Enter sends, Shift+Enter adds a line, and the send button is disabled until there is text. While `busy`, it turns into a stop button.

```tsx
<ChatComposer busy={streaming} onAttach={pick} onSend={send} onStop={abort} tools={<ModelPicker />} />
```

Pass `tools` for controls on the toolbar and `hint` for small print below.

## Origin

Written for this library, following the ai-elements prompt input pattern.
