# Auth: Forgot Password

An email field that sends a reset link, then a check your email page with the mail apps to open and a resend that counts down.

```tsx
import { Auth6, auth6ExampleProps } from "./auth-06";

<Auth6 {...auth6ExampleProps} />;
```

`auth6ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth6Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-06
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
