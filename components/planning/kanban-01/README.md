# Kanban: Sprint Board

Issues with labels, assignees, due dates, priorities, comments and subtasks, and columns that warn when past their WIP limit.

```tsx
import { Kanban1, kanban1ExampleProps } from "./kanban-01";

<Kanban1 {...kanban1ExampleProps} />;
```

`kanban1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Kanban1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/kanban-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kanban/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kanban) (MIT).
