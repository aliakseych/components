# Deployments: Environments

What each environment is running and how many commits are waiting to be promoted to the next.

```tsx
import { Deployments2, deployments2ExampleProps } from "./deployments-02";

<Deployments2 {...deployments2ExampleProps} />;
```

`deployments2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Deployments2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/deployments-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/deployments/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/deployments) (MIT).
