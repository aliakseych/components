# Auth: Two-Factor Code

The 6-digit code from an authenticator app, with a recovery code instead, the tries left and an option to trust the device.

```tsx
import { Auth3, auth3ExampleProps } from "./auth-03";

<Auth3 {...auth3ExampleProps} />;
```

`auth3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
