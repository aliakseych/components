import { useId, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { GitBranch, Plus, Settings2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type WorkflowStepKind = "trigger" | "action" | "condition";
export type WorkflowStepStatus = "idle" | "ok" | "warning" | "error";

export type WorkflowStep = {
  id: string;
  kind: WorkflowStepKind;
  title: string;
  detail?: string;
  status?: WorkflowStepStatus;
};

export type WorkflowBuilderColors = {
  /** Trigger icon and tint. Default: var(--chart-1). */
  trigger?: string;
  /** Action icon and tint. Default: var(--chart-2). */
  action?: string;
  /** Condition icon and tint. Default: var(--chart-5). */
  condition?: string;
  /** OK status dot. Default: var(--chart-4). */
  ok?: string;
  /** Warning status dot. Default: var(--chart-3). */
  warning?: string;
};

export type WorkflowBuilderProps = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
  /** Starting steps when the builder keeps its own state. */
  initialSteps?: WorkflowStep[];
  /** Steps for controlled use. When set, `initialSteps` is ignored. */
  steps?: WorkflowStep[];
  /** Called with the next steps after any change. */
  onChange?: (steps: WorkflowStep[]) => void;
  /** Colour roles. Each becomes a `--workflow-builder-*` variable on the root. */
  colors?: WorkflowBuilderColors;
};

const kindMeta: Record<WorkflowStepKind, { label: string; icon: LucideIcon; tone: string }> = {
  trigger: {
    label: "Trigger",
    icon: Zap,
    tone: "bg-[color-mix(in_oklab,var(--workflow-builder-trigger)_15%,transparent)] text-[var(--workflow-builder-trigger)]",
  },
  action: {
    label: "Action",
    icon: Settings2,
    tone: "bg-[color-mix(in_oklab,var(--workflow-builder-action)_15%,transparent)] text-[var(--workflow-builder-action)]",
  },
  condition: {
    label: "Condition",
    icon: GitBranch,
    tone: "bg-[color-mix(in_oklab,var(--workflow-builder-condition)_15%,transparent)] text-[var(--workflow-builder-condition)]",
  },
};

const statusMeta: Record<WorkflowStepStatus, { label: string; dot: string }> = {
  idle: { label: "Not run", dot: "bg-muted-foreground" },
  ok: { label: "OK", dot: "bg-[var(--workflow-builder-ok)]" },
  warning: { label: "Warning", dot: "bg-[var(--workflow-builder-warning)]" },
  error: { label: "Error", dot: "bg-destructive" },
};

function newStepId() {
  return `step-${Math.random().toString(36).slice(2, 8)}`;
}

function Connector() {
  return (
    <svg aria-hidden="true" width="2" height="16" className="shrink-0 overflow-visible">
      <line x1="1" y1="0" x2="1" y2="16" strokeWidth={2} className="stroke-border" />
    </svg>
  );
}

/**
 * A vertical flow of trigger, action and condition steps joined by lines.
 * Select a step to edit it beside the canvas, or below it on narrow screens.
 * Use `initialSteps` to keep state inside, or `steps` and `onChange` to control it.
 */
export function WorkflowBuilder({
  initialSteps = [],
  steps: controlledSteps,
  onChange,
  colors,
  className,
  style,
  ...props
}: WorkflowBuilderProps) {
  const colorVars = {
    "--workflow-builder-trigger": colors?.trigger ?? "var(--chart-1)",
    "--workflow-builder-action": colors?.action ?? "var(--chart-2)",
    "--workflow-builder-condition": colors?.condition ?? "var(--chart-5)",
    "--workflow-builder-ok": colors?.ok ?? "var(--chart-4)",
    "--workflow-builder-warning": colors?.warning ?? "var(--chart-3)",
  } as CSSProperties;

  const [internalSteps, setInternalSteps] = useState(initialSteps);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => (controlledSteps ?? initialSteps)[0]?.id,
  );
  const formId = useId();

  const isControlled = controlledSteps !== undefined;
  const steps = isControlled ? controlledSteps : internalSteps;
  const selected = steps.find((step) => step.id === selectedId) ?? steps[0];

  function update(next: WorkflowStep[]) {
    if (!isControlled) setInternalSteps(next);
    onChange?.(next);
  }

  function updateSelected(patch: Partial<WorkflowStep>) {
    if (!selected) return;
    update(steps.map((step) => (step.id === selected.id ? { ...step, ...patch } : step)));
  }

  function addAfter(index: number) {
    const step: WorkflowStep = { id: newStepId(), kind: "action", title: "New step", detail: "" };
    const next = [...steps.slice(0, index + 1), step, ...steps.slice(index + 1)];
    update(next);
    setSelectedId(step.id);
  }

  return (
    <div
      className={cn("grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]", className)}
      style={{ ...colorVars, ...style }}
      {...props}
    >
      <div className="max-h-[560px] min-w-0 overflow-auto rounded-xl border bg-muted/30 p-6">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">This flow has no steps yet.</p>
            <button
              type="button"
              onClick={() => addAfter(-1)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Add step
            </button>
          </div>
        ) : (
          <ol aria-label="Flow steps" className="mx-auto flex max-w-sm flex-col">
            {steps.map((step, index) => {
              const meta = kindMeta[step.kind];
              const Icon = meta.icon;
              const isSelected = selected?.id === step.id;
              return (
                <li key={step.id} className="flex flex-col">
                  <button
                    type="button"
                    aria-current={isSelected ? "step" : undefined}
                    onClick={() => setSelectedId(step.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left shadow-xs outline-none transition-colors hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      isSelected && "border-foreground ring-1 ring-foreground",
                    )}
                  >
                    <span
                      className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tone)}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className="block truncate text-sm font-medium">
                        {step.title || "Untitled step"}
                      </span>
                      {step.detail ? (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {step.detail}
                        </span>
                      ) : null}
                    </span>
                    {step.status ? (
                      <>
                        <span
                          aria-hidden="true"
                          className={cn("mt-1.5 size-2 shrink-0 rounded-full", statusMeta[step.status].dot)}
                        />
                        <span className="sr-only">Status: {statusMeta[step.status].label}</span>
                      </>
                    ) : null}
                  </button>
                  <div className="flex flex-col items-center">
                    <Connector />
                    <button
                      type="button"
                      onClick={() => addAfter(index)}
                      className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <Plus aria-hidden="true" className="size-3" />
                      Add step
                      <span className="sr-only">after {step.title || "untitled step"}</span>
                    </button>
                    {index < steps.length - 1 ? <Connector /> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <aside aria-label="Step settings" className="min-w-0 rounded-xl border bg-card p-4 shadow-xs">
        <h3 className="mb-4 text-sm font-semibold">Step settings</h3>
        {selected ? (
          <form key={selected.id} onSubmit={(event) => event.preventDefault()} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input
                id={`${formId}-name`}
                value={selected.title}
                onChange={(event) => updateSelected({ title: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-kind`}>Kind</Label>
              <select
                id={`${formId}-kind`}
                value={selected.kind}
                onChange={(event) => updateSelected({ kind: event.target.value as WorkflowStepKind })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {(Object.keys(kindMeta) as WorkflowStepKind[]).map((kind) => (
                  <option key={kind} value={kind}>
                    {kindMeta[kind].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-detail`}>Detail</Label>
              <Textarea
                id={`${formId}-detail`}
                rows={4}
                value={selected.detail ?? ""}
                onChange={(event) => updateSelected({ detail: event.target.value })}
              />
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Select a step to edit it.</p>
        )}
      </aside>
    </div>
  );
}
