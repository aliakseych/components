# Deployments: Build Health

The last runs of each pipeline as a strip, with the pass rate, median duration and the pipeline that fails most.

```tsx
import { Deployments4, deployments4ExampleProps } from "./deployments-04";

<Deployments4 {...deployments4ExampleProps} />;
```

`deployments4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Deployments4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/deployments-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/deployments/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/deployments) (MIT).
