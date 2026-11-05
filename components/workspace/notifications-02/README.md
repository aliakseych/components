# Notifications: Requests

Notifications that ask for a decision, such as a request to join or a refund, with a tab of the ones still waiting.

```tsx
import { Notifications2, notifications2ExampleProps } from "./notifications-02";

<Notifications2 {...notifications2ExampleProps} />;
```

`notifications2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Notifications2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/notifications-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/notifications/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/notifications) (MIT).
