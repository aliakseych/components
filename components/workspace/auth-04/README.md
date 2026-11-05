# Auth: Verify Email

A code sent by email, a resend that waits a minute between emails, and a way to fix a mistyped address.

```tsx
import { Auth4, auth4ExampleProps } from "./auth-04";

<Auth4 {...auth4ExampleProps} />;
```

`auth4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
