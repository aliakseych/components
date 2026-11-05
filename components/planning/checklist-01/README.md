# Checklist: Onboarding

Setup steps with a progress bar, the next step named, and each step opening to show what it involves.

```tsx
import { Checklist1, checklist1ExampleProps } from "./checklist-01";

<Checklist1 {...checklist1ExampleProps} />;
```

`checklist1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Checklist1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/checklist-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/checklist/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/checklist) (MIT).
