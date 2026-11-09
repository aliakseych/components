import { useId, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { ArrowLeft, Minus, SignalHigh, SignalLow, SignalMedium, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type IssuePriority = "urgent" | "high" | "medium" | "low" | "none";

export type SplitIssue = {
  id: string;
  title: string;
  priority: IssuePriority;
  assignees?: string[];
  labels?: string[];
  description?: string;
  startDate?: string;
  dueDate?: string;
};

export type IssueGroup = {
  state: string;
  /** A chart token name such as "chart-2", or any CSS colour. */
  color?: string;
  issues: SplitIssue[];
};

export type IssueSplitViewColors = {
  /** Urgent priority icon. Default: var(--destructive). */
  urgent?: string;
  /** High priority icon. Default: var(--chart-3). */
  high?: string;
  /** Medium priority icon. Default: var(--chart-2). */
  medium?: string;
  /** Low priority icon. Default: var(--chart-4). */
  low?: string;
  /** No-priority icon and the dot of a group without a colour. Default: var(--muted-foreground). */
  muted?: string;
};

export type IssueSplitViewProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  groups: IssueGroup[];
  /** Controlled selection. When set, `defaultSelectedId` is ignored. */
  selectedId?: string;
  defaultSelectedId?: string;
  onSelect?: (issue: SplitIssue) => void;
  /** Colour roles. Each becomes a `--issue-split-view-*` variable on the root. */
  colors?: IssueSplitViewColors;
};

const priorityMeta: Record<IssuePriority, { label: string; icon: LucideIcon; tone: string }> = {
  urgent: { label: "Urgent", icon: TriangleAlert, tone: "text-[var(--issue-split-view-urgent)]" },
  high: { label: "High", icon: SignalHigh, tone: "text-[var(--issue-split-view-high)]" },
  medium: { label: "Medium", icon: SignalMedium, tone: "text-[var(--issue-split-view-medium)]" },
  low: { label: "Low", icon: SignalLow, tone: "text-[var(--issue-split-view-low)]" },
  none: { label: "No priority", icon: Minus, tone: "text-[var(--issue-split-view-muted)]" },
};

const priorityOptions = Object.keys(priorityMeta) as IssuePriority[];

const chartDot: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function GroupDot({ color }: { color?: string }) {
  const chartClass = color ? chartDot[color] : undefined;
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full", chartClass ?? "bg-[var(--issue-split-view-muted)]")}
      style={!chartClass && color ? { backgroundColor: color } : undefined}
    />
  );
}

/**
 * Issues grouped by state on the left, and the selected issue's detail on
 * the right. The group counts come from the issues. On small screens the
 * list comes first, and choosing an issue opens its detail with a Back button.
 */
export function IssueSplitView({
  groups,
  selectedId,
  defaultSelectedId,
  onSelect,
  colors,
  className,
  style,
  ...props
}: IssueSplitViewProps) {
  const colorVars = {
    "--issue-split-view-urgent": colors?.urgent ?? "var(--destructive)",
    "--issue-split-view-high": colors?.high ?? "var(--chart-3)",
    "--issue-split-view-medium": colors?.medium ?? "var(--chart-2)",
    "--issue-split-view-low": colors?.low ?? "var(--chart-4)",
    "--issue-split-view-muted": colors?.muted ?? "var(--muted-foreground)",
  } as CSSProperties;

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const allIssues = groups.flatMap((group) => group.issues);
  const [internalId, setInternalId] = useState(defaultSelectedId ?? allIssues[0]?.id);
  const [detailOpen, setDetailOpen] = useState(false);

  const isControlled = selectedId !== undefined;
  const activeId = isControlled ? selectedId : internalId;
  const selected = allIssues.find((issue) => issue.id === activeId) ?? allIssues[0];
  const selectedGroup = groups.find((group) => group.issues.some((issue) => issue.id === selected?.id));

  function choose(issue: SplitIssue) {
    if (!isControlled) setInternalId(issue.id);
    setDetailOpen(true);
    onSelect?.(issue);
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card md:grid md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]",
        className,
      )}
      style={{ ...colorVars, ...style }}
      {...props}
    >
      <section
        aria-labelledby={`${uid}-list`}
        className={cn("min-h-0 min-w-0 flex-col border-r", detailOpen ? "hidden md:flex" : "flex")}
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 id={`${uid}-list`} className="text-sm font-semibold">
            Issues
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">{allIssues.length}</span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {groups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No issues.</p>
          ) : null}
          {groups.map((group, groupIndex) => {
            const headingId = `${uid}-group-${groupIndex}`;
            return (
              <section key={group.state} aria-labelledby={headingId} className="pb-2">
                <h3
                  id={headingId}
                  className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground"
                >
                  <GroupDot color={group.color} />
                  <span className="text-foreground">{group.state}</span>
                  <span className="ml-auto tabular-nums">{group.issues.length}</span>
                </h3>
                <ul className="grid gap-0.5">
                  {group.issues.map((issue) => {
                    const isSelected = selected?.id === issue.id;
                    const priority = priorityMeta[issue.priority];
                    const Icon = priority.icon;
                    return (
                      <li key={issue.id}>
                        <button
                          type="button"
                          aria-current={isSelected ? "true" : undefined}
                          onClick={() => choose(issue)}
                          className={cn(
                            "grid w-full grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-md px-2 py-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                          )}
                        >
                          <Icon aria-hidden="true" className={cn("size-4", priority.tone)} />
                          <span className="min-w-0">
                            <span className="block font-mono text-[11px] text-muted-foreground">{issue.id}</span>
                            <span className="block truncate">{issue.title}</span>
                            <span className="sr-only">{priority.label} priority</span>
                          </span>
                          {issue.assignees?.length ? (
                            <span className="flex -space-x-1.5">
                              {issue.assignees.map((name) => (
                                <Avatar key={name} size="sm" className="ring-2 ring-card">
                                  <AvatarFallback>{initials(name)}</AvatarFallback>
                                </Avatar>
                              ))}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby={`${uid}-detail`}
        className={cn("min-h-0 min-w-0 flex-col", detailOpen ? "flex" : "hidden md:flex")}
      >
        {selected ? (
          <div key={selected.id} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <header className="flex items-center gap-2 border-b px-4 py-3">
              <Button type="button" variant="ghost" size="sm" className="-ml-2 md:hidden" onClick={() => setDetailOpen(false)}>
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
            </header>

            <div className="grid gap-6 p-4 md:p-6">
              <h2 id={`${uid}-detail`} className="text-xl font-semibold tracking-tight">
                {selected.title}
              </h2>

              <section aria-labelledby={`${uid}-description`} className="grid gap-2">
                <h3 id={`${uid}-description`} className="text-xs font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="rounded-lg bg-muted/40 p-4 text-sm leading-6">
                  {selected.description || "No description."}
                </p>
              </section>

              <div className="grid gap-3 text-sm">
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
                  <Label htmlFor={`${uid}-state`} className="text-muted-foreground">
                    State
                  </Label>
                  <select
                    id={`${uid}-state`}
                    defaultValue={selectedGroup?.state}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {groups.map((group) => (
                      <option key={group.state} value={group.state}>
                        {group.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
                  <Label htmlFor={`${uid}-priority`} className="text-muted-foreground">
                    Priority
                  </Label>
                  <select
                    id={`${uid}-priority`}
                    defaultValue={selected.priority}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityMeta[priority].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3">
                  <span className="pt-2 text-muted-foreground">Assignees</span>
                  {selected.assignees?.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {selected.assignees.map((name) => (
                        <li key={name} className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <span>{name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="pt-2 text-muted-foreground">Unassigned</span>
                  )}
                </div>

                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3">
                  <span className="pt-1 text-muted-foreground">Labels</span>
                  {selected.labels?.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {selected.labels.map((label) => (
                        <li key={label}>
                          <Badge variant="outline">{label}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="pt-1 text-muted-foreground">None</span>
                  )}
                </div>

                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
                  <span className="text-muted-foreground">Start date</span>
                  {selected.startDate ? (
                    <time dateTime={selected.startDate}>{selected.startDate}</time>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>

                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
                  <span className="text-muted-foreground">Due date</span>
                  {selected.dueDate ? (
                    <time dateTime={selected.dueDate}>{selected.dueDate}</time>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">Select an issue to see its details.</p>
        )}
      </section>
    </div>
  );
}
