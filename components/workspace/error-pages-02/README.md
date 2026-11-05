# Error Pages: No Access

Who can give access, a request with an optional message, and the account you're signed in with.

```tsx
import { ErrorPages2, errorPages2ExampleProps } from "./error-pages-02";

<ErrorPages2 {...errorPages2ExampleProps} />;
```

`errorPages2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ErrorPages2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/error-pages-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/error-pages/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/error-pages) (MIT).
