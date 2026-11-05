# Forecast: Date to Target

The running total heading for a goal line, with the date the forecast reaches it and what each week needs to make the deadline.

```tsx
import { Forecast2, forecast2ExampleProps } from "./forecast-02";

<Forecast2 {...forecast2ExampleProps} />;
```

`forecast2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Forecast2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/forecast-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/forecast/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/forecast) (MIT).
