"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import groupBy from "lodash.groupby";
import {
  CalendarIcon,
  ChevronRightIcon,
  EyeIcon,
  GanttChartSquareIcon,
  KanbanSquareIcon,
  LinkIcon,
  ListIcon,
  TableIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/data-display/table";
import { CalendarWithDayView } from "@/components/planning/calendar";
import {
  GanttCreateMarkerTrigger,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "@/components/planning/gantt";
import { Board, type KanbanItem } from "@/components/planning/kanban";
import {
  ListGroup,
  ListHeader,
  ListItem,
  ListItems,
  ListProvider,
} from "@/components/planning/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type RoadmapStatus = { id: string; name: string; color: string };
export type RoadmapUser = { id: string; name: string; image?: string };
export type RoadmapNamed = { id: string; name: string };

export type RoadmapFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: RoadmapStatus;
  owner?: RoadmapUser;
  group: RoadmapNamed;
  product?: RoadmapNamed;
  initiative?: RoadmapNamed;
  release?: RoadmapNamed;
};

export type RoadmapMarker = {
  id: string;
  date: Date;
  label: string;
  className?: string;
};

export type RoadmapView = "gantt" | "calendar" | "list" | "kanban" | "table";

export type RoadmapProps = {
  statuses: RoadmapStatus[];
  /** The starting features. The roadmap then keeps its own copy. */
  defaultFeatures: RoadmapFeature[];
  markers?: RoadmapMarker[];
  title?: string;
  defaultView?: RoadmapView;
  onFeaturesChange?: (features: RoadmapFeature[]) => void;
  onViewFeature?: (id: string) => void;
  onCopyFeatureLink?: (id: string) => void;
  onAddFeature?: (date: Date) => void;
  onCreateMarker?: (date: Date) => void;
  onRemoveMarker?: (id: string) => void;
  className?: string;
};

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const mediumDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const OwnerAvatar = ({
  owner,
  className,
}: {
  owner?: RoadmapUser;
  className: string;
}) =>
  owner ? (
    <Avatar className={className}>
      <AvatarImage alt={owner.name} src={owner.image} />
      <AvatarFallback>{owner.name.slice(0, 2)}</AvatarFallback>
    </Avatar>
  ) : null;

const views = [
  { id: "gantt", label: "Gantt", icon: GanttChartSquareIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "list", label: "List", icon: ListIcon },
  { id: "kanban", label: "Kanban", icon: KanbanSquareIcon },
  { id: "table", label: "Table", icon: TableIcon },
] as const;

const columns: ColumnDef<RoadmapFeature>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative size-6 shrink-0">
          <OwnerAvatar className="size-6" owner={row.original.owner} />
          <div
            className="absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background"
            style={{ backgroundColor: row.original.status.color }}
          />
        </div>
        <div>
          <span className="font-medium">{row.original.name}</span>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            {row.original.product && (
              <>
                <span>{row.original.product.name}</span>
                <ChevronRightIcon size={12} />
              </>
            )}
            <span>{row.original.group.name}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "startAt",
    header: ({ column }) => (
      <TableColumnHeader column={column} title="Start At" />
    ),
    cell: ({ row }) => mediumDate.format(row.original.startAt),
  },
  {
    accessorKey: "endAt",
    header: ({ column }) => <TableColumnHeader column={column} title="End At" />,
    cell: ({ row }) => mediumDate.format(row.original.endAt),
  },
  {
    id: "release",
    accessorFn: (row) => row.release?.name ?? "",
    header: ({ column }) => (
      <TableColumnHeader column={column} title="Release" />
    ),
    cell: ({ row }) => row.original.release?.name ?? "",
  },
];

/** Shows one set of features as a Gantt chart, calendar, list, kanban or table. */
export const Roadmap = ({
  statuses,
  defaultFeatures,
  markers = [],
  title = "Roadmap",
  defaultView = "gantt",
  onFeaturesChange,
  onViewFeature,
  onCopyFeatureLink,
  onAddFeature,
  onCreateMarker,
  onRemoveMarker,
  className,
}: RoadmapProps) => {
  const [features, setStoredFeatures] = useState(defaultFeatures);

  const setFeatures = (next: RoadmapFeature[]) => {
    setStoredFeatures(next);
    onFeaturesChange?.(next);
  };

  const setStatus = (id: string, status: RoadmapStatus) =>
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, status } : feature
      )
    );

  const groups = useMemo(
    () =>
      Object.entries(groupBy(features, "group.name")).sort(([a], [b]) =>
        a.localeCompare(b)
      ),
    [features]
  );

  const thisYear = new Date().getFullYear();
  const years = features.flatMap((feature) => [
    feature.startAt.getFullYear(),
    feature.endAt.getFullYear(),
  ]);

  const handleListDragEnd = ({ active, over }: DragEndEvent) => {
    const status = statuses.find(({ name }) => name === over?.id);
    if (status) setStatus(String(active.id), status);
  };

  const kanbanData: (RoadmapFeature & KanbanItem)[] = features.map((feature) => ({
    ...feature,
    title: feature.name,
    column: feature.status.id,
  }));

  return (
    <Tabs
      className={cn("size-full gap-0 divide-y bg-card", className)}
      defaultValue={defaultView}
    >
      <div className="flex items-center justify-between gap-4 p-4">
        <p className="font-medium">{title}</p>
        <TabsList>
          {views.map((view) => (
            <TabsTrigger aria-label={view.label} key={view.id} value={view.id}>
              <view.icon size={16} />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent className="overflow-hidden" value="gantt">
        <GanttProvider
          className="rounded-none"
          onAddItem={onAddFeature}
          range="monthly"
          zoom={100}
        >
          <GanttSidebar collapsible>
            {groups.map(([group, items]) => (
              <GanttSidebarGroup key={group} name={group}>
                {items.map((feature) => (
                  <GanttSidebarItem
                    feature={feature}
                    key={feature.id}
                    onSelectItem={onViewFeature}
                  />
                ))}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {groups.map(([group, items]) => (
                <GanttFeatureListGroup key={group}>
                  {items.map((feature) => (
                    <div className="flex" key={feature.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => onViewFeature?.(feature.id)}
                            type="button"
                          >
                            <GanttFeatureItem
                              onMove={(id, startAt, endAt) => {
                                if (!endAt) return;
                                setFeatures(
                                  features.map((item) =>
                                    item.id === id
                                      ? { ...item, startAt, endAt }
                                      : item
                                  )
                                );
                              }}
                              {...feature}
                            >
                              <p className="flex-1 truncate text-xs">
                                {feature.name}
                              </p>
                              <OwnerAvatar
                                className="h-4 w-4"
                                owner={feature.owner}
                              />
                            </GanttFeatureItem>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => onViewFeature?.(feature.id)}
                          >
                            <EyeIcon
                              className="text-muted-foreground"
                              size={16}
                            />
                            View feature
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => onCopyFeatureLink?.(feature.id)}
                          >
                            <LinkIcon
                              className="text-muted-foreground"
                              size={16}
                            />
                            Copy link
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2 text-destructive"
                            onClick={() =>
                              setFeatures(
                                features.filter(
                                  (item) => item.id !== feature.id
                                )
                              )
                            }
                          >
                            <TrashIcon size={16} />
                            Remove from roadmap
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            {markers.map((marker) => (
              <GanttMarker
                key={marker.id}
                {...marker}
                onRemove={onRemoveMarker}
              />
            ))}
            <GanttToday />
            {onCreateMarker && (
              <GanttCreateMarkerTrigger onCreateMarker={onCreateMarker} />
            )}
          </GanttTimeline>
        </GanttProvider>
      </TabsContent>

      <TabsContent className="overflow-auto" value="calendar">
        <CalendarWithDayView
          features={features}
          yearRange={{
            start: Math.min(thisYear, ...years),
            end: Math.max(thisYear, ...years),
          }}
        />
      </TabsContent>

      <TabsContent className="overflow-hidden" value="list">
        <ListProvider className="overflow-auto" onDragEnd={handleListDragEnd}>
          {statuses.map((status) => (
            <ListGroup id={status.name} key={status.name}>
              <ListHeader color={status.color} name={status.name} />
              <ListItems>
                {features
                  .filter((feature) => feature.status.id === status.id)
                  .map((feature, index) => (
                    <ListItem
                      id={feature.id}
                      index={index}
                      key={feature.id}
                      name={feature.name}
                      parent={status.name}
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <p className="m-0 flex-1 font-medium text-sm">
                        {feature.name}
                      </p>
                      <OwnerAvatar
                        className="h-4 w-4 shrink-0"
                        owner={feature.owner}
                      />
                    </ListItem>
                  ))}
              </ListItems>
            </ListGroup>
          ))}
        </ListProvider>
      </TabsContent>

      <TabsContent className="overflow-hidden" value="kanban">
        <Board<RoadmapFeature & KanbanItem>
          className="p-4"
          columns={statuses.map((status) => ({
            id: status.id,
            title: status.name,
            color: status.color,
          }))}
          createItem={(title, column) => ({
            id: `feature-${Date.now()}`,
            name: title,
            title,
            column,
            startAt: new Date(),
            endAt: new Date(),
            status: statuses.find(({ id }) => id === column) ?? statuses[0],
            group: { id: "new", name: "New" },
          })}
          items={kanbanData}
          label={`${title} board`}
          onItemsChange={(next) =>
            setFeatures(
              next.map(({ column, title: _title, ...feature }) => ({
                ...feature,
                status:
                  statuses.find(({ id }) => id === column) ?? feature.status,
              }))
            )
          }
          onOpen={onViewFeature}
          renderCard={(feature) => (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="m-0 flex-1 font-medium text-sm">
                    {feature.name}
                  </p>
                  {feature.initiative && (
                    <p className="m-0 text-muted-foreground text-xs">
                      {feature.initiative.name}
                    </p>
                  )}
                </div>
                <OwnerAvatar
                  className="h-4 w-4 shrink-0"
                  owner={feature.owner}
                />
              </div>
              <p className="m-0 text-muted-foreground text-xs">
                {shortDate.format(feature.startAt)} -{" "}
                {longDate.format(feature.endAt)}
              </p>
            </>
          )}
        />
      </TabsContent>

      <TabsContent className="overflow-hidden" value="table">
        <div className="size-full overflow-auto">
          <TableProvider columns={columns} data={features}>
            <TableHeader>
              {({ headerGroup }) => (
                <TableHeaderGroup
                  headerGroup={headerGroup}
                  key={headerGroup.id}
                >
                  {({ header }) => (
                    <TableHead header={header} key={header.id} />
                  )}
                </TableHeaderGroup>
              )}
            </TableHeader>
            <TableBody>
              {({ row }) => (
                <TableRow key={row.id} row={row}>
                  {({ cell }) => <TableCell cell={cell} key={cell.id} />}
                </TableRow>
              )}
            </TableBody>
          </TableProvider>
        </div>
      </TabsContent>
    </Tabs>
  );
};
