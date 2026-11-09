# Live Orb

Inspired by https://21st.dev/@radiumcoders/components/live-orb; independently written.

A sphere with two capsule eyes. The eyes follow the pointer, clamped to a small range. `state` sets the motion: `idle` breathes slowly, `listening` pulses a ring, and `thinking` blinks. It is pure CSS and React state, with no WebGL.

```tsx
import { LiveOrb } from "@/components/ai-chat/live-orb";

<LiveOrb variant="tone" tone="var(--chart-4)" state="listening" size={96} />;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"light" \| "dark" \| "tone"` | `"light"` | Light and dark use theme tokens |
| `tone` | `string` | | Any CSS colour, used when `variant` is `"tone"`, for example `var(--chart-4)` |
| `state` | `"idle" \| "listening" \| "thinking"` | `"idle"` | Sets the motion |
| `size` | `number` | `160` | Width and height in pixels |
| `label` | `string` | | Overrides the accessible name, which otherwise says the state |
| `className` | `string` | | Also accepts every other `div` prop |
| `colors` | `{ body?, shade?, eye?, glow? }` | from `variant` | Colour roles, see Theming |

The orb is `role="img"`. With `prefers-reduced-motion: reduce`, breathing, blinking and the pulse stop. The listening ring stays visible as a still outline.

## Theming

`colors`: `body` (top of the sphere), `shade` (bottom), `eye` (capsule eyes) and `glow` (the listening pulse ring). Defaults come from `variant`: light uses background, muted and foreground; dark uses a faded foreground; tone uses the `tone` colour. They are set on the root as `--live-orb-*`. The orb paints no stage, so put a dark or gradient backdrop behind it.

## Origin

Inspired by https://21st.dev/@radiumcoders/components/live-orb; independently written.
