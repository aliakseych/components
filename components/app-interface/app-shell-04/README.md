# App Shell: Top Navigation

Page links under the top bar instead of a sidebar, with the ones that don't fit under More on a small screen.

```tsx
import { AppShell4, appShell4ExampleProps } from "./app-shell-04";

<AppShell4 {...appShell4ExampleProps} />;
```

`appShell4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AppShell4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/app-shell-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/app-shell/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/app-shell) (MIT).
