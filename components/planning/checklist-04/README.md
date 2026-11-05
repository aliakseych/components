# Checklist: Task List

Tasks grouped by team, with owners, due dates and checkboxes, and overdue tasks in red.

```tsx
import { Checklist4, checklist4ExampleProps } from "./checklist-04";

<Checklist4 {...checklist4ExampleProps} />;
```

`checklist4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Checklist4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/checklist-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/checklist/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/checklist) (MIT).
