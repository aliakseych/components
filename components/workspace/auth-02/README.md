# Auth: Workspace Picker

Every workspace you're in, with your role, pending invites you can join and a search once there are more than five.

```tsx
import { Auth2, auth2ExampleProps } from "./auth-02";

<Auth2 {...auth2ExampleProps} />;
```

`auth2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
