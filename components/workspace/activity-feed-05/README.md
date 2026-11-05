# Activity Feed: Social Activity

Slack and GitHub activity in one timeline, with quoted messages, actions such as starting a review, and what's waiting on you.

```tsx
import { ActivityFeed5, activityFeed5ExampleProps } from "./activity-feed-05";

<ActivityFeed5 {...activityFeed5ExampleProps} />;
```

`activityFeed5ExampleProps` holds sample data. Pass your own props in its shape; the types are exported as `ActivityFeed5Props`.

## Install in an app

```bash
npx shadcn@latest add @dashboardblocks/activity-feed-05
```

The CLI copies the block, the dashboardblocks parts it uses and the shadcn parts it needs. The source in this library lives under `components/dashboardblocks/activity-feed/`.

## Origin

From [dashboardblocks](https://www.dashboardblocks.com/docs/blocks/activity-feed) (MIT).
