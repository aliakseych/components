# Notebook Cell

Inspired by https://21st.dev/community/apps/marimo; independently written.

A Jupyter- or marimo-style cell. Every part is optional, so one component covers an input-only cell, an output-only cell, or both.

- **Input:** `code` with line numbers and syntax highlighting for `python`, `javascript`, `typescript` and `sql`. Set `editable` to type in it. Ctrl or Cmd + Enter runs the cell.
- **Header:** `executionCount` shows as `[3]`, `language` shows as a badge, and `onRun` adds a Run button.
- **Output:** a string, a `{ type: "table", columns, rows }` object, or any React node. `status` (`idle`, `running`, `ok`, `error`) and `durationMs` show above it.

```tsx
import { NotebookCell } from "@/components/code/notebook-cell";

<NotebookCell
  language="python"
  executionCount={3}
  status="ok"
  durationMs={412}
  code={'by_region = orders.groupby("region").size()'}
  output={{ type: "table", columns: ["Region", "Orders"], rows: [["North", 1240]] }}
  onRun={() => runCell(3)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `code` | `string` | | Source. Omit for an output-only cell |
| `language` | `"python" \| "javascript" \| "typescript" \| "sql" \| "text"` | | Shows a badge. `text` skips highlighting |
| `executionCount` | `number` | | Shown as `[n]`, or `[ ]` when omitted, `[*]` while running |
| `status` | `"idle" \| "running" \| "ok" \| "error"` | `"idle"` | Dot colour: muted, `chart-2`, `destructive`, pulsing accent |
| `output` | `ReactNode \| { type: "table", columns, rows }` | | Omit for no output area |
| `durationMs` | `number` | | Shown beside the status |
| `onRun` | `() => void` | | Adds a Run button, disabled while running |
| `editable` | `boolean` | `false` | Makes the code a textarea over the highlighted view |
| `onCodeChange` | `(code: string) => void` | | Called on each edit when `editable` |
| `colors` | `{ keyword, string, comment, number, accent }` | theme tokens | Sets `--nb-*` custom properties on the root |
| `className` | `string` | | Also accepts every other `section` prop except `children` |

The component paints no page background. Wrap it in one. Colours default to `chart-1` to `chart-4` and `muted-foreground`. Pass `colors` to override them with any CSS colour.

Highlighting works one line at a time, so a multi-line string or block comment colours only its first and last lines.

## Origin

Inspired by https://21st.dev/community/apps/marimo; independently written.
