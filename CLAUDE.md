# Component library

Personal library of copy-in React, TypeScript and Tailwind components.

## Find things

- Search `catalog/index.json` first. Do not scan `components/` to discover components.
- Each component is at `components/<category>/<slug>/`.
- Whole apps to start a project from are templates in `templates/<slug>/`, listed under `templates` in `catalog/index.json`. See "Templates" in `docs/conventions.md`.
- Search by tag with the `tags` map in `catalog/index.json`; the allowed tags are defined in `tags.json`.
- Rules are in `docs/conventions.md`; metadata fields are in `docs/metadata-schema.md`.

## Rules

- Never edit `catalog/`, `previews/` or `llms.txt` by hand. They are generated.
- Use only tags that exist in `tags.json`. Never invent one in `meta.json`. If no tag fits, add it to `tags.json` first with a one-line description, and only when at least two components could use it. Validation rejects unknown tags.
- Keep each component self-contained. The only imports allowed from outside its folder are `@/lib/utils`, shadcn parts from `@/components/ui/*` listed in `meta.shadcn`, and other library components from `@/components/<category>/<slug>` listed in `meta.composes`.
- When putting a component into an app, prefer `meta.install` if it is set: run `npx shadcn@latest add <install>` in the app. Copy files only as a fallback.
- Never add `meta.json` under vendored trees: `components/ui/`, `components/dashboardblocks/`, `components/icons/`, `hooks/` and `lib/`. They are not library components. `components/ui/` holds shared shadcn parts.
- A component's folder is its category. Use only categories from `categories.json`.
- Blocks in `blocks/*.json` group alternatives for one kind of screen into slots. A block is a recipe, not importable code. When a new component fits a slot, add it as an option, even if it overlaps an existing one. Options are written `category/slug/demo`.
- Declare every third-party import except React in `meta.dependencies`, and add it to the root `package.json` so the gallery can render it.
- Remove app-specific data, routes, API calls, secrets and business logic from harvested code.
- Look at the generated screenshots before reporting a component as working. A passing script does not prove it looks right.
- Run `pnpm run check` before committing a component.

## Workflows

Use the skills in `.claude/skills/`: `harvest-component`, `find-component`, `use-component` and `preview-component`.
