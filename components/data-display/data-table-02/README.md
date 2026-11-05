# Data Table: Inline Bars

Revenue by product, with a bar scaled to the top product and each product's share of the total.

```tsx
import { DataTable2, dataTable2ExampleProps } from "./data-table-02";

<DataTable2 {...dataTable2ExampleProps} />;
```

`dataTable2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `DataTable2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/data-table-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/data-table/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/data-table) (MIT).
