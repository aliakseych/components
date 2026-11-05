# Auth: Reset Password

A new password with a strength meter and the rules it still needs, then a way back to sign in, or a new link when this one has expired.

```tsx
import { Auth7, auth7ExampleProps } from "./auth-07";

<Auth7 {...auth7ExampleProps} />;
```

`auth7ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth7Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-07
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
