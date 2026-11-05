# Security: Two-Factor Authentication

An authenticator app, security keys, passkeys and recovery codes, with the last method kept while the workspace requires two-factor.

```tsx
import { Security5, security5ExampleProps } from "./security-05";

<Security5 {...security5ExampleProps} />;
```

`security5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
