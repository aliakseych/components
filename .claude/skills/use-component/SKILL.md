---
name: use-component
description: Use when the user asks to add, install or copy a component from their component library into an app.
---

# Use a component

The library is at `/Users/aliakseych/Projects/components`. If the component hasn't been chosen, use `find-component` first.

1. Read the component's `README.md`, `meta.json` and source.
2. If `meta.json` has `install`, run `npx shadcn@latest add <install>` in the target app. The CLI copies the component and what it needs. Then continue at step 6 to adapt it. If the command fails, fall back to copying.
3. Check that the target app can support it: React, Tailwind, and the Tailwind `dark:` setup if the app has dark mode.
4. Copy the source files into the app's existing component folder, without `demos/`, `previews/` or `meta.json`. Keep the library copy unchanged.
5. Install the packages in `meta.dependencies` with the app's package manager. Run `npx shadcn add` for each part in `meta.shadcn`. Repeat these steps for each component in `meta.composes`, and update its `@/components/<category>/<slug>` imports to where you copied it.
6. Adapt imports and styling to the app's conventions and design tokens.
7. Run the app's type check, then render the component where it's used and check how it looks.
8. Report what you copied and changed. If an improvement would help every app, suggest harvesting it back.
