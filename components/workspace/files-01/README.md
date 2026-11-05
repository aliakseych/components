# Files: Upload

A dropzone with the accepted types and size limit, and each upload's progress, which you can cancel, retry or remove.

```tsx
import { Files1, files1ExampleProps } from "./files-01";

<Files1 {...files1ExampleProps} />;
```

`files1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Files1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/files-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/files/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/files) (MIT).
