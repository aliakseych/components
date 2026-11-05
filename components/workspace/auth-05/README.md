# Auth: Sign In

One form to sign in or sign up, with Google, X and GitHub on one row and a row at the bottom that unfolds the sign-up fields.

```tsx
import { Auth5, auth5ExampleProps } from "./auth-05";

<Auth5 {...auth5ExampleProps} />;
```

`auth5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Auth5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/auth-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/auth/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/auth) (MIT).
