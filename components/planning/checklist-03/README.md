# Checklist: Progress Card

A compact block with the share of steps done and the next one, to bring people back to setup.

```tsx
import { Checklist3, checklist3ExampleProps } from "./checklist-03";

<Checklist3 {...checklist3ExampleProps} />;
```

`checklist3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Checklist3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/checklist-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/checklist/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/checklist) (MIT).
