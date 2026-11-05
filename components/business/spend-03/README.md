# Spend: Spend vs Budget

Monthly spend as bars against a stepped budget line, with months over budget labelled and the year-to-date variance.

```tsx
import { Spend3, spend3ExampleProps } from "./spend-03";

<Spend3 {...spend3ExampleProps} />;
```

`spend3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Spend3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/spend-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/spend/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/spend) (MIT).
