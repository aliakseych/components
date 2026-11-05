"use client";

import { PlusIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import {
  KanbanAddCard,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardTitle,
  KanbanColumn,
  type KanbanColumnDef,
  type KanbanItem,
  getColumnItems,
  moveItem,
} from "@/components/dashboardblocks/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export {
  KanbanAddCard,
  KanbanAssignees,
  KanbanAttachments,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardStat,
  KanbanCardTitle,
  KanbanColumn,
  KanbanComments,
  KanbanCount,
  KanbanDueDate,
  KanbanLabel,
  KanbanLabels,
  KanbanPriority,
  KanbanSubtasks,
  getColumnItems,
  moveItem,
} from "@/components/dashboardblocks/kanban";
export type {
  KanbanColumnDef,
  KanbanItem,
  KanbanLabelDef,
  KanbanPriorityLevel,
} from "@/components/dashboardblocks/kanban";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export type BoardProps<T extends KanbanItem = KanbanItem> = {
  /** Accessible name of the board. */
  label: string;
  /** Heading above the board. */
  title?: ReactNode;
  /** One muted line under the heading, such as a progress summary. */
  description?: ReactNode;
  /** What a card is called in empty columns and counts. */
  itemName?: { one: string; other: string };
  columns: KanbanColumnDef[];
  items: T[];
  onItemsChange: (items: T[]) => void;
  /** Enables the "Add column" control. */
  onColumnsChange?: (columns: KanbanColumnDef[]) => void;
  /** Builds a new item from the typed title. Defaults to `{ id, title, column }`. */
  createItem?: (title: string, column: string) => T;
  /** Draws the inside of a card. Defaults to the title and a move menu. */
  renderCard?: (item: T) => ReactNode;
  onOpen?: (id: string) => void;
  addCardLabel?: string;
  addColumnLabel?: string;
  wipLimitMode?: "block" | "warn";
  className?: string;
};

/** A drag-and-drop board on the dashboardblocks kanban, with buttons to add cards and columns. */
export function Board<T extends KanbanItem = KanbanItem>({
  label,
  title,
  description,
  itemName,
  columns,
  items,
  onItemsChange,
  onColumnsChange,
  createItem,
  renderCard,
  onOpen,
  addCardLabel = "Add card",
  addColumnLabel = "Add column",
  wipLimitMode,
  className,
}: BoardProps<T>) {
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");

  const addItem = (title: string, column: string) => {
    const item = createItem
      ? createItem(title, column)
      : ({ id: newId(), title, column } as T);
    onItemsChange([...items, item]);
  };

  const addColumn = (event: FormEvent) => {
    event.preventDefault();
    const title = columnTitle.trim();
    if (!title || !onColumnsChange) return;
    onColumnsChange([...columns, { id: newId(), title }]);
    setColumnTitle("");
    setAddingColumn(false);
  };

  return (
    <section className={cn("@container flex flex-col gap-3", className)}>
      {(title || description) && (
        <header className="flex flex-col gap-0.5">
          {title && <h2 className="font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </header>
      )}
      <KanbanBoard
        className="pb-2"
        columns={columns}
        itemName={itemName}
        items={items}
        label={label}
        onMove={(id, column, index) => onItemsChange(moveItem(items, id, column, index))}
        onOpen={onOpen}
        wipLimitMode={wipLimitMode}
      >
        {columns.map((column) => (
          <KanbanColumn
            column={column}
            footer={
              <KanbanAddCard
                label={addCardLabel}
                onAdd={(title) => addItem(title, column.id)}
              />
            }
            key={column.id}
          >
            {getColumnItems(items, column.id).map((item) => (
              <KanbanCard item={item} key={item.id}>
                {renderCard ? (
                  renderCard(item)
                ) : (
                  <>
                    <KanbanCardTitle className="pr-7" />
                    <KanbanCardMenu className="absolute top-3 right-2" />
                  </>
                )}
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
        {onColumnsChange && (
          <div className="flex w-72 max-w-[calc(100cqw-2.5rem)] shrink-0 snap-start flex-col border-t border-dashed pt-3">
            {addingColumn ? (
              <form className="flex flex-col gap-2" onSubmit={addColumn}>
                <Input
                  aria-label="Column title"
                  autoFocus
                  onChange={(event) => setColumnTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setAddingColumn(false);
                  }}
                  placeholder="Column title"
                  value={columnTitle}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" type="submit">
                    Add
                  </Button>
                  <Button
                    onClick={() => setAddingColumn(false)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                className="justify-start text-muted-foreground"
                onClick={() => setAddingColumn(true)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <PlusIcon />
                {addColumnLabel}
              </Button>
            )}
          </div>
        )}
      </KanbanBoard>
    </section>
  );
}
