# AI Usage: Prompt Caching

The share of input tokens served from the cache, its change, what it saved and what tokens would have cost without it.

```tsx
import { AiUsage4, aiUsage4ExampleProps } from "./ai-usage-04";

<AiUsage4 {...aiUsage4ExampleProps} />;
```

`aiUsage4ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `AiUsage4Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/ai-usage-04
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/ai-usage/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/ai-usage) (MIT).
