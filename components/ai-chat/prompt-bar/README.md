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

## Caveats

- `midnightPreset` is designed for dark backgrounds.
- Menus open above the bar, so leave room over it.
- Some aria labels and "No matches" text are hard-coded in English.
- Screenshots show resting states. Try the menus and slider in the gallery.

## Origin

Copied from `uzexify_agent`, which adapted it from React Bits. Check the React Bits license before using it in a commercial product. `midnight.css` holds the app's glass styling, moved out of its global CSS.
