# Comments: Update

A composer with a preview of how mentions will look and who will be notified, above the latest updates.

```tsx
import { Comments2, comments2ExampleProps } from "./comments-02";

<Comments2 {...comments2ExampleProps} />;
```

`comments2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Comments2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/comments-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/comments/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/comments) (MIT).
