# Adding a component

1. Create the folder:

   ```bash
   pnpm run new actions/my-button
   ```

2. Add the code to `index.tsx`, removing anything specific to the original app.
3. Add a demo for each meaningful state.
4. Fill in `meta.json` and `README.md`. Validation fails while either contains `TODO`. Choose `tags` from [`tags.json`](../tags.json).
5. Add any third-party packages to the root `package.json` and to `meta.dependencies`. If the component comes from a shadcn registry, set `install` to its item name. List shadcn parts in `meta.shadcn` and other library components in `meta.composes`.
6. Run the checks:

   ```bash
   pnpm run check
   ```

7. Open the screenshots in `previews/` and try the interactions in the gallery.
8. Commit the component and the regenerated catalog:

   ```text
   feat(actions): add my-button
   ```

To have an agent do this, ask it to move the component into your library. It uses the `harvest-component` skill.
