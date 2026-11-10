# Bubble

A chat bubble with color variants (`default`, `secondary`, `muted`, `tinted`, `outline`, `ghost`, `destructive`), grouping and reactions on the top or bottom edge. `BubbleContent` can render as a link or button with `render`.

Pair it with `messaging/message` for avatars, names and timestamps. Reactions hang off the edge, so the wrapper reserves room for them.

```bash
npx shadcn@latest add bubble
```

## Origin

shadcn/ui `bubble`, Base UI flavour (https://ui.shadcn.com/docs/components/base/bubble), copied unchanged into `components/ui/bubble-base.tsx`. It needs `@base-ui/react`. The Radix flavour (`asChild`) stays in `components/ui/bubble.tsx` for the dashboardblocks parts that use it.
