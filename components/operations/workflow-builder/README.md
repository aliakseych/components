# Workflow Builder

Inspired by https://21st.dev/community/apps/activepieces; independently written.

A vertical flow of step nodes joined by SVG lines. Each node is a button. The selected step's settings sit beside the canvas, or below it on narrow screens. "Add step" between nodes inserts an action after that node and selects it. The canvas scrolls inside its own box.

```tsx
import { WorkflowBuilder } from "@/components/operations/workflow-builder";

// Uncontrolled: the builder keeps the steps.
<WorkflowBuilder initialSteps={steps} />;

// Controlled: you keep the steps and save them in onChange.
<WorkflowBuilder steps={steps} onChange={setSteps} />;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `initialSteps` | `WorkflowStep[]` | `[]` | Starting steps for internal state |
| `steps` | `WorkflowStep[]` | | Controlled steps; when set, `initialSteps` is ignored |
| `onChange` | `(steps: WorkflowStep[]) => void` | | Called after every edit or insert |
| `className` | `string` | | Also accepts every other `div` prop except `onChange` |
| `colors` | `{ trigger?, action?, condition?, ok?, warning? }` | chart tokens | Colour roles, see Theming |

`WorkflowStep` is `{ id, kind: "trigger" \| "action" \| "condition", title, detail?, status?: "idle" \| "ok" \| "warning" \| "error" }`.

## Theming

`colors`: `trigger`, `action` and `condition` (step icon and tint, defaults `var(--chart-1)`, `var(--chart-2)`, `var(--chart-5)`), and `ok` and `warning` (status dots, `var(--chart-4)` and `var(--chart-3)`). They are set on the root as `--workflow-builder-*`. The error status keeps the `destructive` token. The root paints no background.

## Origin

Inspired by https://21st.dev/community/apps/activepieces; independently written.
