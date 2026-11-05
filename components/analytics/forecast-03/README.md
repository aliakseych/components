# Forecast: Run-Rate

Month to date, projected to the end of the month at the daily run-rate, with what's needed per day to hit the target.

```tsx
import { Forecast3, forecast3ExampleProps } from "./forecast-03";

<Forecast3 {...forecast3ExampleProps} />;
```

`forecast3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Forecast3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/forecast-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/forecast/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/forecast) (MIT).
