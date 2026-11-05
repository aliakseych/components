# Kanban: Support Queue

Tickets with priority and time left to their SLA, with a full column that refuses more tickets.

```tsx
import { Kanban3, kanban3ExampleProps } from "./kanban-03";

<Kanban3 {...kanban3ExampleProps} />;
```

`kanban3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Kanban3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/kanban-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/kanban/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/kanban) (MIT).
