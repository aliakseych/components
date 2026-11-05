# Deployments: Delivery Performance

The four DORA metrics with the change on the period before and the band each one falls in.

```tsx
import { Deployments3, deployments3ExampleProps } from "./deployments-03";

<Deployments3 {...deployments3ExampleProps} />;
```

`deployments3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Deployments3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/deployments-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/deployments/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/deployments) (MIT).
