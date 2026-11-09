# Note Outline

Inspired by https://21st.dev/community/apps/siyuan; independently written.

A notebook tree on the left, a document with a breadcrumb and content blocks in the middle, and an outline on the right. The outline is computed from the heading blocks, and clicking an entry scrolls that heading into view. Below `md` the tree opens in a sheet. Below `xl` the outline folds into an "On this page" disclosure.

```tsx
import { NoteOutline } from "@/components/workspace/note-outline";

<NoteOutline
  notebooks={[{ name: "Engineering", documents: ["API conventions"] }]}
  selected={{ notebook: "Engineering", document: "API conventions" }}
  blocks={[
    { type: "heading", level: 1, text: "Versioning" },
    { type: "paragraph", text: "Versions live in the path." },
  ]}
  onSelect={(selection) => openDocument(selection)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `notebooks` | `{ name: string; documents: string[] }[]` | | Tree contents |
| `selected` | `{ notebook: string; document: string }` | | The open document; its title is `document` |
| `blocks` | `NoteBlock[]` | | `type` is `heading`, `paragraph`, `list`, `quote` or `code`; `level` (1 to 3) for headings; `items` for lists |
| `onSelect` | `(selection) => void` | | Called when a document in the tree is chosen |
| `colors` | `NoteOutlineColors` | theme tokens | Colour roles, see Theming |
| `className` | `string` | | Also accepts every other `div` prop except `children` |

The tree and outline are buttons with `aria-current` on the open document. The document body scrolls inside its own box.

## Theming

`colors` sets the colour roles, each a CSS colour: `accent` (open document in the tree), `surface` (document panel), `code` (code block background) and `muted` (secondary text). Defaults are `var(--accent)`, `var(--card)`, `var(--muted)` and `var(--muted-foreground)`. The component paints no page background; the demo wrapper does.

## Origin

Inspired by https://21st.dev/community/apps/siyuan; independently written.
