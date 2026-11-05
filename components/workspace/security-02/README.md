# Security: Audit Log

Changes to access, keys and settings, newest first, with a toggle to show only warnings and critical changes.

```tsx
import { Security2, security2ExampleProps } from "./security-02";

<Security2 {...security2ExampleProps} />;
```

`security2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Security2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/security-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/security/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/security) (MIT).
