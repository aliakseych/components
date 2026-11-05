# Settings: API Keys

Keys with their access, when they were last used and who created them, with a new key shown once.

```tsx
import { Settings2, settings2ExampleProps } from "./settings-02";

<Settings2 {...settings2ExampleProps} />;
```

`settings2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Settings2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/settings-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/settings/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/settings) (MIT).
