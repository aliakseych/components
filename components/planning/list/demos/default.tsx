import type { DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { ListGroup, ListHeader, ListItem, ListItems, ListProvider } from "../index";

const statuses = [
  { name: "Planned", color: "var(--chart-2)" },
  { name: "In progress", color: "var(--chart-3)" },
  { name: "Done", color: "var(--chart-4)" },
];

const initial = [
  { id: "brief", name: "Write the brief", status: "Done" },
  { id: "pricing", name: "Update pricing page", status: "In progress" },
  { id: "email", name: "Draft launch email", status: "Planned" },
];

export default function Demo() {
  const [items, setItems] = useState(initial);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    setItems(
      items.map((item) =>
        item.id === active.id ? { ...item, status: String(over.id) } : item
      )
    );
  };

  return (
    <div className="w-full max-w-xl rounded-lg border">
      <ListProvider onDragEnd={onDragEnd}>
        {statuses.map((status) => (
          <ListGroup id={status.name} key={status.name}>
            <ListHeader color={status.color} name={status.name} />
            <ListItems>
              {items
                .filter((item) => item.status === status.name)
                .map((item, index) => (
                  <ListItem
                    id={item.id}
                    index={index}
                    key={item.id}
                    name={item.name}
                    parent={status.name}
                  />
                ))}
            </ListItems>
          </ListGroup>
        ))}
      </ListProvider>
    </div>
  );
}
