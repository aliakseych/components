# Comments: Review

Comments on a document in a column beside it, each quoting the words it's about.

```tsx
import { Comments3, comments3ExampleProps } from "./comments-03";

<Comments3 {...comments3ExampleProps} />;
```

`comments3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Comments3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/comments-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/comments/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/comments) (MIT).
