# Magnetic Button

A button that gently follows a mouse cursor while hovered.

```tsx
import { MagneticButton } from "./magnetic-button";

<MagneticButton strength={0.4} onClick={startTrial}>
  Start free trial
</MagneticButton>;
```

## Props

Accepts every native `button` prop, plus:

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `strength` | `number` | `0.3` | How far it follows the cursor, from 0 to 1 |

## Caveats

- The effect runs only for mouse pointers, and stays off when reduced motion is requested.
- `ref` isn't forwarded.
- `className` is appended, so it can't reliably override the default classes without a class-merging helper.

## Origin

Written as the library's example component.
