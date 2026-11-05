# Decrypted Text

Text that scrambles through random characters and resolves into the real words.

```tsx
import { DecryptedText } from "./decrypted-text";

<DecryptedText text="Ask anything" animateOn="view" sequential speed={35} characters="=+xX0S8#@" />;
```

The original app uses the `characters` and `speed` values above. All props are typed in `index.tsx`.

To restart the animation when the text changes, such as after a language switch, give the component a new `key`.

## Origin

Copied from `uzexify_agent`, where it's vendored from React Bits. Check the React Bits license before using it in a commercial product.
