# Command Menu: Pages and Actions

Pages and actions with their shortcuts, opened here with <kbd>⌘/</kbd> because <kbd>⌘K</kbd> opens this site's search.

```tsx
import { CommandMenu1, commandMenu1ExampleProps } from "./command-menu-01";

<CommandMenu1 {...commandMenu1ExampleProps} />;
```

`commandMenu1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `CommandMenu1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/command-menu-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/command-menu/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/command-menu) (MIT).
