# App Shell: Inset

The page in a card beside the sidebar, with plan usage and an upgrade link above the user menu.

```tsx
import { AppShell3, appShell3ExampleProps } from "./app-shell-03";

<AppShell3 {...appShell3ExampleProps} />;
```

`appShell3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AppShell3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/app-shell-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/app-shell/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/app-shell) (MIT).
