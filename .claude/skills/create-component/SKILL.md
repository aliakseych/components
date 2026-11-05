---
name: create-component
description: Use when creating a new library component, writing its meta.json, or choosing its category, tags or block placement.
---

# Create a component

The library is at `/Users/aliakseych/Projects/components`. Read `CLAUDE.md` and `docs/conventions.md` first. To bring in code from another project, also follow `harvest-component`.

## 1. Check it doesn't already exist

Search `catalog/index.json` by need, `tags`, `summary` and `useWhen`. If something overlaps:

- Extend it when the difference is a prop or a variant.
- Add a demo when it's only another state.
- Add a new component only when the job or the structure differs. Then add an `avoidWhen` line to both, naming the other: "..., where `category/slug` fits better".

## 2. Choose the category

The folder is the category: `components/<category>/<slug>/`. Use a key from `categories.json`, chosen by the job the component does, not what it looks like or where it came from. Never invent a category to fit one component. Add one only if at least five components need it and none fits, with a `name` and `description`.

Slugs are kebab-case and unique across the library. Name the thing, not its source.

Never put a component in `components/ui`, `components/dashboardblocks` or `components/icons`. Those are vendored. A component may wrap them with an `index.tsx` that re-exports.

## 3. Write the code

Run `pnpm run new <category>/<slug>`, then:

- Export the component and its `Props` type by name. Pass data through props, never hard-coded.
- Derive every visual from the values it displays. A bar labelled 72% must be 72% wide. Never draw a chart from separate decorative data.
- Style like dashboardblocks (see `docs/conventions.md`, "Visual style"): theme tokens only, no raw colors except data given by props. Chart series use `chart-1` to `chart-5`, and so do status colors, with `destructive` for errors. Icons come from `lucide-react`.
- Allowed imports from outside the folder: `@/lib/utils`, `@/components/ui/*` (list in `meta.shadcn`), `@/components/<category>/<slug>` (list in `meta.composes`), `@/components/dashboardblocks/*` (needs `meta.install`). Use a dependency only if listed in `meta.dependencies` and the root `package.json`.
- Support dark mode, keyboard use, reduced motion, and a 390px-wide screen.

## 4. Write the demos

One file per meaningful state in `demos/`, default-exporting a component with realistic content. Capture records the resting state, so give hover, open and error states their own demo when they matter.

## 5. Write `meta.json`

| Field | Rule |
| --- | --- |
| `name` | Short and unique. For a family, `Family: Variant` |
| `summary` | One sentence on what it shows or does |
| `tags` | 2 to 5, only from `tags.json` |
| `useWhen` | Real situations it suits |
| `avoidWhen` | Real limits, naming the better alternative where one exists |
| `dependencies`, `shadcn`, `composes`, `install` | Exactly what the code imports |
| `source` | Where it came from |
| `status` | `experimental` until checked, then `stable`. `deprecated` when replaced |

## 6. Choose tags

Open `tags.json` and read it. Tags describe what a component is, does or is for, in the words someone would search. Pick the most specific ones that apply, and skip tags true of nearly everything nearby, such as `chart` on every analytics item when a more specific tag exists.

Add a tag only if no existing tag or synonym fits and at least two components can use it now. Add it to `tags.json` with a one-line description. Validation rejects unknown tags. Don't add a tag that means the same as an existing one, such as `metrics` beside `stats`.

## 7. Add it to blocks

Find the block in `blocks/*.json` for the screen it belongs to, and add `category/slug/demo` as an option in the matching slot. Overlap is fine, since the chooser exists for it. A new slot needs a job of its own. Create a block only for a kind of screen with at least two slots.

## 8. Verify

```bash
pnpm run validate <slug>
pnpm run capture <slug>
pnpm run index
pnpm run typecheck
```

Open the screenshots in `previews/`, in both widths and themes, and check that:

- Numbers match the graphics drawn for them, and every series and legend swatch has a color.
- No text overlaps, clips or runs out of its box.
- Interactions work in the gallery (`pnpm run dev`). Restart it after adding packages.

Passing scripts don't prove it looks right. Report anything you couldn't verify. Commit or push only when asked.
