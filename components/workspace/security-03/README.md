# Security: Active Sessions

The devices signed in to an account, with where and when each was last active, and buttons to sign them out.

```tsx
import { Security3, security3ExampleProps } from "./security-03";

<Security3 {...security3ExampleProps} />;
```

`security3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
