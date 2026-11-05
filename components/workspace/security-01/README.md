# Security: Sign-in Activity

Failed and blocked sign-ins per day against a typical day, with the failure rate, any spike in blocked attempts and MFA coverage.

```tsx
import { Security1, security1ExampleProps } from "./security-01";

<Security1 {...security1ExampleProps} />;
```

`security1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
