# Onboarding: Connect a Source

Search and pick a source, then follow it through connecting to connected.

```tsx
import { Onboarding3, onboarding3ExampleProps } from "./onboarding-03";

<Onboarding3 {...onboarding3ExampleProps} />;
```

`onboarding3ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Onboarding3Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/onboarding-03
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/onboarding/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/onboarding) (MIT).
