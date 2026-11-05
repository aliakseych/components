# Onboarding: Welcome

The first page of an empty workspace: quick starts, an empty dashboards list with a way in, setup progress and help.

```tsx
import { Onboarding2, onboarding2ExampleProps } from "./onboarding-02";

<Onboarding2 {...onboarding2ExampleProps} />;
```

`onboarding2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Onboarding2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/onboarding-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/onboarding/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/onboarding) (MIT).
