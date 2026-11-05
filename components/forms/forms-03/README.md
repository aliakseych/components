# Forms: Wizard

A form in steps, each checked before moving on, with a review of everything before it's created.

```tsx
import { Forms3, forms3ExampleProps } from "./forms-03";

<Forms3 {...forms3ExampleProps} />;
```

`forms3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Forms3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/forms-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/forms/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/forms) (MIT).
