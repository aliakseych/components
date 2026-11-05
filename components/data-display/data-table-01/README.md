# Data Table: Sortable

A table you sort by any column, with a second click reversing the order.

```tsx
import { DataTable1, dataTable1ExampleProps } from "./data-table-01";

<DataTable1 {...dataTable1ExampleProps} />;
```

`dataTable1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `DataTable1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/data-table-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/data-table/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/data-table) (MIT).
