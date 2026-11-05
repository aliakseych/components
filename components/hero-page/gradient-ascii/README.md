# Gradient ASCII Background

An animated WebGL background. It fills its parent, so give the parent a size.

| Export | Shows |
| --- | --- |
| `GradientASCII` | Both layers, with characters following the glow |
| `HorizonBackground` | Only the glow; `shape` can be `horizon`, `pinch`, `rise` or `eclipse` |
| `NoiseBackground` | Only random characters, spread evenly |

```tsx
import { HorizonBackground, NoiseBackground } from "./gradient-ascii";

<div className="fixed inset-0 -z-10 bg-[#07080d]">
  <HorizonBackground className="absolute inset-0" />
  <NoiseBackground className="absolute inset-0" cellSize={14} glyphOpacity={0.4} />
</div>;
```

`HorizonBackground` and `NoiseBackground` accept every `GradientASCII` prop, including `colors`, `speed`, `characters` and `cellSize`. All props are typed in `index.tsx`.

## Caveats

- Without WebGL 2, it renders nothing, so set a background color on the parent.
- By default, it listens for pointer movement across the window to scramble nearby characters. Set `mouseInteraction={false}` to turn this off.
- `intro` plays a 2.4-second reveal. It's skipped when reduced motion is requested.
- Reduced motion also stops the continuous animation.

## Origin

Copied from `uzexify_agent`, where it's vendored from React Bits. Check the React Bits license before using it in a commercial product. The `flat` shape and the two single-layer exports were added here.
