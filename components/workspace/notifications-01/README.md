# Notifications: Bell

The latest notifications in a panel, with mark all as read and a link to the inbox.

```tsx
import { Notifications1, notifications1ExampleProps } from "./notifications-01";

<Notifications1 {...notifications1ExampleProps} />;
```

`notifications1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Notifications1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/notifications-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/notifications/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/notifications) (MIT).
