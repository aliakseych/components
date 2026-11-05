# Lattice Loader

A small animated dot grid that shows waiting, then morphs into a tick or a cross.

```tsx
import { LatticeLoader } from "./lattice-loader";

<LatticeLoader status={status} label="Searching" doneLabel="Found in" />;
```

For just the icon, set `label`, `doneLabel` and `errorLabel` to `""`, and `showTimer` to `false`. All props are typed in `index.tsx`.

## Patterns

- 3×3 grid: `arrow`, `dots`, `ripple`, `spiral`, `orbit`, `snake`
- 4×4 grid: `orbit`, `snake`, `sweep`, `spin`, `rain`, `pulse`

A name that doesn't exist for the chosen grid falls back to that grid's default.

## Origin

Copied from `uzexify_agent`, where it's vendored from React Bits. Check the React Bits license before using it in a commercial product.
