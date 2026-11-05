# Alerts: Summary

A slim strip with open alerts by severity and the latest one, for the top of a dashboard.

```tsx
import { Alerts4, alerts4ExampleProps } from "./alerts-04";

<Alerts4 {...alerts4ExampleProps} />;
```

`alerts4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Alerts4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/alerts-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/alerts/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/alerts) (MIT).
