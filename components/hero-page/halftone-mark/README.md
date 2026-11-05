# Halftone Mark

An animated logo or icon filled with flowing colored light, shaped by any image you provide.

```tsx
import { HalftoneMark } from "./halftone-mark";
import logo from "./logo.svg";

<div className="size-40">
  <HalftoneMark src={logo} label="Acme" />
</div>;
```

Use a simple, solid shape, and size the mark with its parent. All props are typed in `index.tsx`.

## Changes from the original

`src` is now required, and `label` no longer defaults to the app's name. The original logo is kept as `demos/sample-mark.svg`, so don't copy it into other products by accident.

## Origin

Copied from `uzexify_agent`, where it's vendored from React Bits. Check the React Bits license before using it in a commercial product.
