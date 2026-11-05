# Checklist: Stepper

The stages of a multi-stage setup, side by side when there's room and stacked when narrow.

```tsx
import { Checklist2, checklist2ExampleProps } from "./checklist-02";

<Checklist2 {...checklist2ExampleProps} />;
```

`checklist2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Checklist2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/checklist-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/checklist/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/checklist) (MIT).
