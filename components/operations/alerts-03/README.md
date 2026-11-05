# Alerts: Rules

Alert rules with their conditions, severities and channels, which one fired last, and a switch to pause each one.

```tsx
import { Alerts3, alerts3ExampleProps } from "./alerts-03";

<Alerts3 {...alerts3ExampleProps} />;
```

`alerts3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Alerts3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/alerts-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/alerts/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/alerts) (MIT).
