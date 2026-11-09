# Server Card

Inspired by https://21st.dev/@mohammadshehadeh/components/server-card; independently written.

A responsive grid of host cards. Each card shows the host's name in monospace, its region and provider, a status pill, its specs and three usage meters. A meter's width and printed percentage come from the same fraction. Meters turn amber above 75% and red above 90%.

```tsx
import { ServerCard } from "@/components/operations/server-card";

<ServerCard
  servers={[
    {
      id: "srv-1",
      name: "api-eu-1",
      region: "eu-west-1",
      provider: "Orbit Cloud",
      status: "online",
      vcpu: 4,
      memoryGb: 16,
      diskGb: 160,
      usage: { cpu: 0.42, memory: 0.63, disk: 0.38 },
    },
  ]}
  onSelect={(server) => openHost(server.id)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `servers` | `Server[]` | | Hosts to show; `usage` values are fractions from 0 to 1 |
| `title` | `string` | `"Servers"` | Heading above the grid |
| `onSelect` | `(server: Server) => void` | | Makes each card's name a button that covers the card |
| `className` | `string` | | Also accepts every other `section` prop except `title` |
| `colors` | `{ accent?, warning?, critical?, online?, idle? }` | theme tokens | Colour roles, see Theming |

Status values are `online` (`chart-4`), `degraded` (`chart-3`) and `provisioning` (muted). The grid has one column on mobile, two from `sm` and three from `xl`.

## Theming

`colors`: `accent` (normal meter fill, default `var(--primary)`), `warning` (above 75%, `var(--chart-3)`), `critical` (above 90%, `var(--destructive)`), `online` (status dot, `var(--chart-4)`) and `idle` (provisioning dot, `var(--muted-foreground)`). They are set on the root as `--server-card-*`. The root paints no background; cards keep their own `bg-card`.

## Origin

Inspired by https://21st.dev/@mohammadshehadeh/components/server-card; independently written.
