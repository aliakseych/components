# Trace

Compact lines of an agent's activity, with status and collapsible detail.

See `demos/default.tsx` for a complete example.

`ToolTimeline` is a vertical timeline of tool calls: one line through all items, slightly tilted cards, and args/result revealed on hover or focus. Pass `items` (`id`, `title`, `tool`, `icon`, `status` of `running`, `done` or `error`, `args`, `result`) and an optional `colors` object (`line`, `node`, `accent`, `running`, `done`, `error`). Unset colours use theme tokens. See `demos/tool-timeline.tsx`.

## Origin

From shadcn/ui.

## Demo origins

The `tool-timeline` demo is inspired by https://21st.dev/@heygaia/components/tool-calls-section; independently written.
