# Insights: Anomaly Callout

An unusual reading against the range it was expected to fall in, with the worst day labelled, the explanation and the likely causes.

```tsx
import { Insights2, insights2ExampleProps } from "./insights-02";

<Insights2 {...insights2ExampleProps} />;
```

`insights2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Insights2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/insights-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/insights/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/insights) (MIT).
