# Folder Card

File-folder shaped card: tinted back with tab, a second sheet peeking top-right, front sheet with duotone icon, view count, 2-line title and a corner watermark (CSS mask on `bg-foreground`, so it tints per theme and fades radially).

## FolderCard props

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Clamped to 2 lines |
| `icon` | lucide icon component | Rendered with a primary duotone look |
| `views` | `number?` | Eye icon + tabular count |
| `watermark` | `string?` | Alpha image URL used as mask |
| `href` / `onClick` | | Link when `href` is set, otherwise a button |
| `className` | `string?` | |

## FolderCardGrid

Responsive 1/2/3-column list; children fade up with a stagger once in view. Pass `className` to change columns.

Hover/focus: card lifts 2px, front sheet slides up exposing the back sheet, watermark rotates -4deg and brightens. Reduced motion keeps visuals, drops movement.
