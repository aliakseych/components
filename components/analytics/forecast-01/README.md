# Forecast: Actual and Forecast

Weekly actuals continuing into a dashed forecast with a shaded 80% range and a today marker.

```tsx
import { Forecast1, forecast1ExampleProps } from "./forecast-01";

<Forecast1 {...forecast1ExampleProps} />;
```

`forecast1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Forecast1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/forecast-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/forecast/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/forecast) (MIT).
