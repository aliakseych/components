# Call Chip

A compact row showing one agent tool call, with its icon, argument, progress and result.

```tsx
import { CallChip } from "./call-chip";

<CallChip icon="search" name="Search" argument="cotton exports" status="running" />;
```

`icon` can be `terminal`, `file`, `search`, `edit` or your own element. Pass `onRetry` to offer a retry after an error. All props are typed in `index.tsx`.

## Caveats

The default `surfaceColor` is dark. Set it and `color` for light themes.

## Origin

Copied from `uzexify_agent`, where it's vendored from React Bits. Check the React Bits license before using it in a commercial product.
