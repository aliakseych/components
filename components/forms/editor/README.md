# Rich Text Editor

A Tiptap editor with a slash menu, formatting bubble menu, tables, code blocks, task lists and a character count.

## Exports

`EditorProvider`, `EditorFloatingMenu`, `EditorBubbleMenu`, `EditorClearFormatting`, `EditorNodeText`, `EditorNodeHeading1`, `EditorNodeHeading2`, `EditorNodeHeading3`, `EditorNodeBulletList`, `EditorNodeOrderedList`, `EditorNodeTaskList`, `EditorNodeQuote`, `EditorNodeCode`, `EditorNodeTable`, `EditorSelector`, `EditorFormatBold`, `EditorFormatItalic`, `EditorFormatStrike`, `EditorFormatCode`, `EditorFormatSubscript`, `EditorFormatSuperscript`, `EditorFormatUnderline`, `EditorLinkSelector`, `EditorTableMenu`, `EditorTableGlobalMenu`, `EditorTableColumnMenu`, `EditorTableRowMenu`, `EditorTableColumnBefore`, `EditorTableColumnAfter`, `EditorTableRowBefore`, `EditorTableRowAfter`, `EditorTableColumnDelete`, `EditorTableRowDelete`, `EditorTableHeaderColumnToggle`, `EditorTableHeaderRowToggle`, `EditorTableDelete`, `EditorTableMergeCells`, `EditorTableSplitCell`, `EditorTableFix`, `EditorCharacterCount`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Caveats

This adds a large set of Tiptap packages. Load it lazily if it is not on every page.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
