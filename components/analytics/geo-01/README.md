# Geo: State Tile Map

Revenue by state on a single-hue scale, with the total and the top five states as ranked bars.

```tsx
import { Geo1, geo1ExampleProps } from "./geo-01";

<Geo1 {...geo1ExampleProps} />;
```

`geo1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Geo1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/geo-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/geo/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/geo) (MIT).
