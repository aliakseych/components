---
name: harvest-component
description: Use when the user asks to move, save, extract or add a UI component from a project into their component library, or to push a component to their components repo.
---

# Harvest a component

The library is at `/Users/aliakseych/Projects/components`. Read its `CLAUDE.md` and `docs/conventions.md` first.

1. In the library, confirm the working tree is clean and run `git pull --ff-only`. Stop and tell the user if either fails.
2. Search `catalog/index.json` for a similar component. If one exists, ask whether to replace it, extend it or add a new one.
3. Read the source component and its local imports. Copy only what it needs. Leave the source project unchanged.
4. Run `pnpm run new <category>/<slug>`, then port the code.
5. Remove app-specific data, routes, API calls, secrets and business logic. Replace them with props.
6. Write a demo for each meaningful state, using realistic sample content.
7. Fill in `meta.json` and `README.md`, with `source` naming the original project. Base `useWhen` and `avoidWhen` on how the component behaves. Read `tags.json` and choose tags only from it. Add a new tag there only if none fits and at least two components could use it.
8. Add third-party dependencies to the root `package.json` and to `meta.dependencies`. If the component came from a shadcn-compatible registry, set `install` in `meta.json` to its registry item name.
9. Run `pnpm run check`.
10. Look at the screenshots in `previews/`. Fix any visual problems and re-run the check.
11. Stage only the component's folder, `catalog/`, `tags.json` if changed, any new `components/ui/` part, and any `package.json` or `pnpm-lock.yaml` change. Commit as `feat(<category>): add <slug>`.
12. Push to `main` only if the user asked to push. Report the path, commit and anything you removed or couldn't verify.

Never push when a check fails or the screenshots look wrong.
