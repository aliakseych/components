# App Shell: Icon Sidebar

A sidebar that collapses to icons with tooltips, with nested sections and help and settings pinned to the bottom.

```tsx
import { AppShell2, appShell2ExampleProps } from "./app-shell-02";

<AppShell2 {...appShell2ExampleProps} />;
```

`appShell2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AppShell2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/app-shell-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/app-shell/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/app-shell) (MIT).
