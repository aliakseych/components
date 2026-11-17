# Inline Image Headline

A statement in 56px / 46px / clamp(29-44px) type. Each word switches from unread grey (`#8c8c8c`) to read ink (`#111214`) (160ms linear) as the block scrolls from 80% of the viewport height up to 30% minus half its height; reduced motion shows everything read. Visuals attached to a text run fade up (700ms, `cubic-bezier(.25,.1,.25,1)`, 10px rise, scale .9→1, 70ms stagger) when the run crosses 25% from the viewport bottom. The statement and pill row also fade up once (800ms). Pills loop at `width / pillSpeed` seconds, paused offscreen or in hidden tabs.

```tsx
<InlineImageHeadline
  segments={[
    { text: "Atlas connects your" },
    { visuals: [<Icon1 />, <Icon2 />, <Icon3 />], text: "systems," },
    { text: "inboxes, and conversations, and prepares your next move." },
  ]}
  pills={[{ label: "Alerts", image: <AlertsSvg /> }]}
/>
```

- `segments`: text runs, or `{ visuals, text? , stacked? }` with visuals placed before the text (stacked = overlapping 48px circles; single visual = 52px).
- `pills`: `{ label, image }`; `image` should be an SVG that scales to height (44px desktop, 36px mobile).
- `pillSpeed`: marquee px per second (default 24).
- The pill marquee is full-bleed: it spans the section's full width, outside the padded text column.
