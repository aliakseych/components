# Emails: Sign-in Code

The code on a dark panel, how long it works, and who asked for it, so someone who didn't can ignore it.

```tsx
import { Email1, email1ExampleProps } from "./email-01";

<Email1 {...email1ExampleProps} />;
```

`email1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Email1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/email-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/email/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/email) (MIT).
