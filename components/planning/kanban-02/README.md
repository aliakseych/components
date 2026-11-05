# Kanban: Deals

A sales board with each column's total value and the next step on every deal.

```tsx
import { Kanban2, kanban2ExampleProps } from "./kanban-02";

<Kanban2 {...kanban2ExampleProps} />;
```

`kanban2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Kanban2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/kanban-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kanban/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kanban) (MIT).
