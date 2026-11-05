# Emails: Invite

Who invited them, to which workspace and with what role, with Accept on the panel and the date the invite runs out.

```tsx
import { Email2, email2ExampleProps } from "./email-02";

<Email2 {...email2ExampleProps} />;
```

`email2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Email2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/email-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/email/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/email) (MIT).
