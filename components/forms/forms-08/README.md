# Forms: Address

An address whose fields follow the country: a state and ZIP code in the US, a postcode in the UK, the postal code before the city in Germany.

```tsx
import { Forms8, forms8ExampleProps } from "./forms-08";

<Forms8 {...forms8ExampleProps} />;
```

`forms8ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Forms8Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/forms-08
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/forms/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/forms) (MIT).
