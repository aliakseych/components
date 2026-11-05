# Data Table

A composable, sortable table built on TanStack Table with column header menus.

## Exports

`TableContext`, `TableHead`, `TableHeaderGroup`, `TableHeader`, `TableCell`, `TableRow`, `TableBody`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Caveats

Requires `@tanstack/react-table` v8; version 9 changed its API. This repo installs v8 under the alias `@tanstack/react-table-v8` because the dashboardblocks tables need v9. In your app, install `@tanstack/react-table@8` and change the import back to `@tanstack/react-table`.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
