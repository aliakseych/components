# Settings: Webhooks

Endpoints with the events they receive, their recent deliveries, the delivery rate and a switch to pause each one.

```tsx
import { Settings5, settings5ExampleProps } from "./settings-05";

<Settings5 {...settings5ExampleProps} />;
```

`settings5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Settings5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/settings-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/settings/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/settings) (MIT).
