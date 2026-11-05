# Kanban Board

A drag-and-drop board on the dashboardblocks kanban, with buttons to add cards and columns. Cards move by mouse, touch or keyboard (Space picks a card up, arrows move it).

```tsx
import { Board } from "./kanban";

<Board
  columns={columns}
  items={items}
  label="Launch board"
  onColumnsChange={setColumns}
  onItemsChange={setItems}
/>;
```

- Every column gets an "Add card" control. Leave out `onColumnsChange` to hide "Add column".
- Items need `id`, `title` and `column`. Pass `createItem` to add your own fields to new cards and `renderCard` to draw them.
- The dashboardblocks parts (`KanbanBoard`, `KanbanColumn`, `KanbanCard`, labels, priorities, due dates) are re-exported for custom boards. See `planning/kanban-01` to `kanban-03` for complete sprint, deals and support boards.

## Origin

Built on `@dashboardblocks/kanban` (MIT). The earlier Kibo kanban was replaced by this one.
