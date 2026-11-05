# App Shell: Sidebar

A workspace switcher, navigation sections with count badges and a user menu, under a top bar with breadcrumbs, search and notifications.

```tsx
import { AppShell1, appShell1ExampleProps } from "./app-shell-01";

<AppShell1 {...appShell1ExampleProps} />;
```

`appShell1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AppShell1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/app-shell-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/app-shell/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/app-shell) (MIT).
