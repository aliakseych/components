# Files: Folder Browser

Folders as tiles over a list of files with their size and last change, and a path back to the top.

```tsx
import { Files4, files4ExampleProps } from "./files-04";

<Files4 {...files4ExampleProps} />;
```

`files4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Files4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/files-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/files/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/files) (MIT).
