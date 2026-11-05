# Notifications: Inbox

Every notification grouped by day, filtered by unread and mentions, to mark read or unread or archive.

```tsx
import { Notifications3, notifications3ExampleProps } from "./notifications-03";

<Notifications3 {...notifications3ExampleProps} />;
```

`notifications3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Notifications3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/notifications-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/notifications/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/notifications) (MIT).
