# Prompt Bar

An AI chat input. Features appear only when you pass their props.

```tsx
import { PromptBar, midnightPreset } from "./prompt-bar";

<PromptBar
  {...midnightPreset}
  placeholders={["Compare cotton prices by month"]}
  efforts={["Fast", "Normal", "Deep"]}
  busy={isLoading}
  onSend={(text, { effort }) => ask(text, effort)}
  onStop={cancel}
/>;
```

## Features

| Feature | Prop that enables it |
| --- | --- |
| Level selector | `efforts` |
| Square particles | Automatic at the last level of `efforts`; typing speeds them up. Set their color with `sparkColor` |
| + button and @ menu | `sources` |
| / menu | `commands` |
| Model picker | `models` |
| Microphone | `onDictate` |
| Rotating placeholders | `placeholders` |

All props are typed in `index.tsx`. Pass `labels` to translate the button and selector text.

## Expanding pill

`ExpandingPromptBar` is a separate, controlled input. It rests as a 320px pill with a mic button. On focus, or once it has text, it grows into a 480px card with suggestion chips behind its top edge and a toolbar holding a model picker, an effort chip, and a `+` button. The mic becomes a send button while there is text.

```tsx
import { ExpandingPromptBar } from "./prompt-bar";

<ExpandingPromptBar
  value={text}
  onChange={setText}
  onSubmit={(value) => ask(value)}
  models={[{ key: "fast", name: "Fast model" }]}
  efforts={["Low", "Medium", "High"]}
  suggestions={["Summarize my week"]}
  onVoice={startDictation}
  onAttach={pickFile}
  colors={{ accent: "var(--primary)" }}
/>;
```

- `colors` sets `accent`, `surface` and `ring` as CSS custom properties on the root. They default to `var(--primary)`, `var(--card)` and `var(--ring)`, so the component has no background of its own apart from its surface.
- The effort chip cycles through `efforts` on click. Model, effort, and their change callbacks each work controlled or uncontrolled.
- Collapses on blur only when the field is empty. Motion is disabled under `prefers-reduced-motion`.
- Needs the `popover` shadcn part (`components/ui/popover.tsx`).

## Caveats

- `midnightPreset` is designed for dark backgrounds.
- Menus open above the bar, so leave room over it.
- Some aria labels and "No matches" text are hard-coded in English.
- Screenshots show resting states. Try the menus and slider in the gallery.

## Origin

Copied from `uzexify_agent`, which adapted it from React Bits. Check the React Bits license before using it in a commercial product. `midnight.css` holds the app's glass styling, moved out of its global CSS.

## Demo origins

The `voice-pill` demo is inspired by https://21st.dev/@jahed/components/ai-chat-input; independently written.
