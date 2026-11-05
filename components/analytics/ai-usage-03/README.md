# AI Usage: Model Performance

Requests, time to first token from the median to the 95th percentile, output speed and error rate for each model.

```tsx
import { AiUsage3, aiUsage3ExampleProps } from "./ai-usage-03";

<AiUsage3 {...aiUsage3ExampleProps} />;
```

`aiUsage3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiUsage3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-usage-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/ai-usage/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-usage) (MIT).
