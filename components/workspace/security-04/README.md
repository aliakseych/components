# Security: Security Posture

A weighted score on a gauge, with failing checks first and what to do about each.

```tsx
import { Security4, security4ExampleProps } from "./security-04";

<Security4 {...security4ExampleProps} />;
```

`security4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
