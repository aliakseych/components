# Security: Single Sign-On

A SAML connection with the details for your identity provider, domains verified by TXT record, and a switch to require SSO.

```tsx
import { Security6, security6ExampleProps } from "./security-06";

<Security6 {...security6ExampleProps} />;
```

`security6ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security6Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-06
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
