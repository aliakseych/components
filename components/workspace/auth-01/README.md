# Auth: Accept Invite

The workspace, who invited you, the role you'll get and who's already there, with a prompt to switch account when the invite is for another address.

```tsx
import { Auth1, auth1ExampleProps } from "./auth-01";

<Auth1 {...auth1ExampleProps} />;
```

`auth1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
