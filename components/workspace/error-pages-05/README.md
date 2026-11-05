# Error Pages: Session Ended

Why the session ended, whether unsaved work was kept, and a sign-in link back to the same page.

```tsx
import { ErrorPages5, errorPages5ExampleProps } from "./error-pages-05";

<ErrorPages5 {...errorPages5ExampleProps} />;
```

`errorPages5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ErrorPages5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/error-pages-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/error-pages/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/error-pages) (MIT).
