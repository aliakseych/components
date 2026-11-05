# Settings: Notifications

Each notification against each channel, grouped by topic, with a switch per channel.

```tsx
import { Settings3, settings3ExampleProps } from "./settings-03";

<Settings3 {...settings3ExampleProps} />;
```

`settings3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Settings3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/settings-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/settings/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/settings) (MIT).
