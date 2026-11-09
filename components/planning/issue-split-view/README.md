# Issue Split View

Inspired by https://21st.dev/community/apps/plane; independently written.

A master-detail issue view. The left column lists issues grouped by state, with counts derived from the issues. Each row shows its monospace ID, title, priority icon and assignee initials, and the selected row has `aria-current`. The right column shows the selected issue's description and properties, using native selects with labels. Below `md` the list shows first, and choosing an issue opens its detail with a Back button.

```tsx
import { IssueSplitView } from "@/components/planning/issue-split-view";

<IssueSplitView
  groups={[
    {
      state: "Todo",
      color: "chart-1",
      issues: [{ id: "KES-47", title: "Add keyboard shortcuts", priority: "medium" }],
    },
  ]}
  defaultSelectedId="KES-47"
  onSelect={(issue) => track(issue.id)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `groups` | `{ state, color?, issues }[]` | | `color` is a chart token name such as `chart-2`, or any CSS colour |
| `defaultSelectedId` | `string` | First issue | Starting selection, used when uncontrolled |
| `selectedId` | `string` | | Controlled selection |
| `onSelect` | `(issue) => void` | | Called when an issue is chosen |
| `className` | `string` | | Also accepts every other `div` prop except `children` |
| `colors` | `{ urgent?, high?, medium?, low?, muted? }` | theme tokens | Colour roles, see Theming |

`SplitIssue` is `{ id, title, priority: "urgent" \| "high" \| "medium" \| "low" \| "none", assignees?, labels?, description?, startDate?, dueDate? }`.

The selects in the detail start from the issue's values. They do not save anywhere, so wire them to your own update logic if you need edits to persist.

## Theming

`colors`: `urgent` (`var(--destructive)`), `high` (`var(--chart-3)`), `medium` (`var(--chart-2)`), `low` (`var(--chart-4)`) for priority icons, and `muted` (`var(--muted-foreground)`) for no priority and uncoloured group dots. They are set on the root as `--issue-split-view-*`. The card keeps its own `bg-card`. Height is not set by the component, so pass a height with `className`, such as `md:h-[600px]`.

## Origin

Inspired by https://21st.dev/community/apps/plane; independently written.
