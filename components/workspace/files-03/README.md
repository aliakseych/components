# Files: Storage

Storage used against the plan, split by kind of file, with the largest files and how much deleting them would free.

```tsx
import { Files3, files3ExampleProps } from "./files-03";

<Files3 {...files3ExampleProps} />;
```

`files3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Files3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/files-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/files/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/files) (MIT).
