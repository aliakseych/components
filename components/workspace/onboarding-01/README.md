# Onboarding: Setup Wizard

Name the workspace and pick its URL, say what it's for, then invite the team.

```tsx
import { Onboarding1, onboarding1ExampleProps } from "./onboarding-01";

<Onboarding1 {...onboarding1ExampleProps} />;
```

`onboarding1ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Onboarding1Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/onboarding-01
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/onboarding/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/onboarding) (MIT).
