# Flow: User Paths

Where visitors go in their first pages after landing, with the ones who left at each step.

```tsx
import { Flow2, flow2ExampleProps } from "./flow-02";

<Flow2 {...flow2ExampleProps} />;
```

`flow2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Flow2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/flow-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/flow/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/flow) (MIT).
