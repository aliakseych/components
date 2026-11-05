# Metadata schema

Every component has a `meta.json`. All fields are required, except `shadcn`, `composes` and `install`.

| Field | Type | Purpose |
| --- | --- | --- |
| `name` | string | Display name |
| `summary` | string | One sentence on what it is |
| `tags` | string[] | Search terms from [`tags.json`](../tags.json); at least one |
| `useWhen` | string[] | Situations it suits; at least one |
| `avoidWhen` | string[] | Situations it doesn't suit; at least one |
| `dependencies` | string[] | npm packages to install, excluding React; can be empty |
| `shadcn` | string[] | Parts it imports from `components/ui`; optional |
| `composes` | string[] | Library components it imports, as `category/slug`; optional |
| `install` | string | shadcn registry item name, such as `@dashboardblocks/kpi-01`; optional |
| `source` | string | The app or place it came from |
| `status` | string | `experimental`, `stable` or `deprecated` |

## `install`

Set `install` when the component comes from a shadcn-compatible registry. The CLI (`npx shadcn@latest add <install>`) then copies the component and everything it needs, so it is the preferred way to put the component in an app. Copying files from this library is the fallback. Validation requires `install` on any component that imports from `@/components/dashboardblocks/`.

## Tags

[`tags.json`](../tags.json) is the only list of allowed tags, and validation rejects anything else. Reuse an existing tag whenever one fits. To add a tag, put it in `tags.json` with a one-line description, and only when at least two components could use it.

`pnpm run index` also writes a `tags` map to `catalog/index.json`, showing which components use each tag.

## Writing `useWhen` and `avoidWhen`

Agents choose components mainly from these fields, so describe real situations and limits.

- Good: `Dense forms or touch-only screens`
- Too vague: `When it isn't appropriate`
