# Alerts: Threshold Breach

The metric over the last hour against its threshold, with the line turning red above it and how far over it is now.

```tsx
import { Alerts2, alerts2ExampleProps } from "./alerts-02";

<Alerts2 {...alerts2ExampleProps} />;
```

`alerts2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Alerts2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/alerts-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/alerts/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/alerts) (MIT).
