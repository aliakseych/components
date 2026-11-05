# States: Empty

A filtered table with no matching rows that says why it's empty and offers a way out.

```tsx
import { States3, states3ExampleProps } from "./states-03";

<States3 {...states3ExampleProps} />;
```

`states3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `States3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/states-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/states/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/states) (MIT).
