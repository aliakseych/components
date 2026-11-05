---
name: preview-component
description: Use when the user asks to see, render, check or visually test a component from their component library.
---

# Preview a component

The library is at `/Users/aliakseych/Projects/components`.

1. Run `pnpm run capture <slug>` to catch console errors and horizontal overflow, and to refresh the screenshots.
2. Look at the screenshots in the component's `previews/` folder across both widths and themes.
3. To test interactions, start `pnpm run dev` and open `http://localhost:5199/#/<category>/<slug>`. Use the hover, focus, keyboard and touch behavior the component offers.
4. Report what works, with specific problems and what you couldn't test.
5. If the screenshots changed and the component is meant to stay this way, run `pnpm run index`. Don't commit unless asked.
