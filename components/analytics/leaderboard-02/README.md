# Leaderboard: Team Ranking

People ranked by revenue, each bar running to the person's quota, with the change on the last period.

```tsx
import { Leaderboard2, leaderboard2ExampleProps } from "./leaderboard-02";

<Leaderboard2 {...leaderboard2ExampleProps} />;
```

`leaderboard2ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `Leaderboard2Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/leaderboard-02
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/leaderboard/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/leaderboard) (MIT).
