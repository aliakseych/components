# States: Error

A block whose request fails, saying it couldn't load in place of the number while the chart keeps its space.

```tsx
import { States4, states4ExampleProps } from "./states-04";

<States4 {...states4ExampleProps} />;
```

`states4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `States4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/states-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/states/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/states) (MIT).
