# AI Usage: Cost by Feature

Model spend by product feature, with each feature's input, cached and output tokens and its cost per thousand requests.

```tsx
import { AiUsage2, aiUsage2ExampleProps } from "./ai-usage-02";

<AiUsage2 {...aiUsage2ExampleProps} />;
```

`aiUsage2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiUsage2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-usage-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/ai-usage/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-usage) (MIT).
