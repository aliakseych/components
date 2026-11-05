# Alerts: Inbox

Alerts, most recent first, each with a button to acknowledge it and a count of what still needs a response.

```tsx
import { Alerts1, alerts1ExampleProps } from "./alerts-01";

<Alerts1 {...alerts1ExampleProps} />;
```

`alerts1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Alerts1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/alerts-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/alerts/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/alerts) (MIT).
