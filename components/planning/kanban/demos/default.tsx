import { useState } from "react";
import {
  Board,
  KanbanAssignees,
  KanbanCardMenu,
  KanbanCardTitle,
  type KanbanColumnDef,
  KanbanComments,
  KanbanDueDate,
  type KanbanItem,
  type KanbanLabelDef,
  KanbanLabels,
  KanbanPriority,
  type KanbanPriorityLevel,
  KanbanSubtasks,
  getColumnItems,
} from "../index";

type Task = KanbanItem & {
  key?: string;
  priority?: KanbanPriorityLevel;
  assignees?: string[];
  labels?: KanbanLabelDef[];
  due?: Date;
  comments?: number;
  subtasks?: { done: number; total: number };
};

const NOW = new Date(Date.UTC(2026, 8, 28, 10));
const inDays = (days: number) => new Date(NOW.getTime() + days * 86_400_000);

const labels = {
  copy: { name: "Copy", tone: "accent" },
  web: { name: "Web", tone: "info" },
  bug: { name: "Bug", tone: "danger" },
  launch: { name: "Launch", tone: "success" },
} satisfies Record<string, KanbanLabelDef>;

const initialColumns: KanbanColumnDef[] = [
  { id: "todo", title: "To do", color: "var(--color-muted-foreground)" },
  { id: "doing", title: "In progress", color: "var(--color-chart-3)", wipLimit: 2 },
  { id: "done", title: "Done", color: "var(--color-chart-2)" },
];

const initialItems: Task[] = [
  {
    id: "email",
    key: "LCH-24",
    title: "Draft launch email",
    column: "todo",
    priority: "high",
    assignees: ["Priya Nair"],
    labels: [labels.copy, labels.launch],
    due: inDays(3),
    comments: 2,
  },
  {
    id: "faq",
    key: "LCH-27",
    title: "Answer pricing questions in the FAQ",
    column: "todo",
    priority: "low",
    assignees: [],
    labels: [labels.copy],
  },
  {
    id: "pricing",
    key: "LCH-19",
    title: "Update pricing page",
    column: "doing",
    priority: "urgent",
    assignees: ["Lena Fischer", "Noah Becker"],
    labels: [labels.web],
    due: inDays(-1),
    comments: 7,
    subtasks: { done: 2, total: 3 },
  },
  {
    id: "safari",
    key: "LCH-21",
    title: "Fix checkout redirect on Safari",
    column: "doing",
    priority: "medium",
    assignees: ["Tomás Ortega"],
    labels: [labels.bug],
    due: inDays(1),
  },
  {
    id: "brief",
    key: "LCH-12",
    title: "Write the brief",
    column: "done",
    priority: "medium",
    assignees: ["Aiko Tanaka"],
    labels: [labels.launch],
    due: inDays(-4),
    subtasks: { done: 4, total: 4 },
  },
];

export default function Demo() {
  const [columns, setColumns] = useState(initialColumns);
  const [items, setItems] = useState(initialItems);
  const done = getColumnItems(items, "done").length;

  return (
    <div className="w-full min-w-0">
      <Board
        columns={columns}
        createItem={(title, column): Task => ({
          id: `task-${items.length + 1}`,
          key: `LCH-${items.length + 28}`,
          title,
          column,
          priority: "medium",
          assignees: [],
        })}
        description={`Website launch, Sep 21 – Oct 4. ${done} of ${items.length} tasks done.`}
        itemName={{ one: "task", other: "tasks" }}
        items={items}
        label="Launch board"
        onColumnsChange={setColumns}
        onItemsChange={setItems}
        renderCard={(task) => (
          <>
            <div className="flex min-h-6 items-center gap-2 pr-7">
              {task.key && (
                <span className="font-mono text-muted-foreground text-xs">{task.key}</span>
              )}
              {task.priority && <KanbanPriority className="mr-auto" priority={task.priority} />}
              {task.assignees && <KanbanAssignees names={task.assignees} />}
            </div>
            <KanbanCardTitle />
            <KanbanCardMenu className="absolute top-3 right-2" />
            {task.labels && task.labels.length > 0 && <KanbanLabels labels={task.labels} />}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 empty:hidden">
              {task.due && (
                <KanbanDueDate date={task.due} done={task.column === "done"} now={NOW} />
              )}
              {task.comments !== undefined && <KanbanComments count={task.comments} />}
              {task.subtasks && (
                <KanbanSubtasks done={task.subtasks.done} total={task.subtasks.total} />
              )}
            </div>
          </>
        )}
        title="Launch board"
      />
    </div>
  );
}
