# Settings: Profile

Your photo, name, email, time zone and theme, in the same sections and save bar as the [Forms](/docs/blocks/forms) blocks.

```tsx
import { Settings7, settings7ExampleProps } from "./settings-07";

<Settings7 {...settings7ExampleProps} />;
```

`settings7ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Settings7Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/settings-07
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/settings/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/settings) (MIT).
