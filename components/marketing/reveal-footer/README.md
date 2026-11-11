# Reveal Footer

A footer that sits beneath the page and is uncovered as the page scrolls away. While it is uncovered, opacity goes 0.4 to 1, scale 0.96 to 1 and blur 6px to 0, driven by `useScroll`. The heading rises per character from a masked baseline, centre outward, once in view. Footer links get an underline that enters from the left and leaves to the right. The wordmark is cropped by the bottom edge, fades from `foreground/10` to `primary`, and brightens under the pointer. With `prefers-reduced-motion` the reveal and rise stop; the spotlight stays.

## Usage

Page content must be `relative z-10 bg-background`; `RevealFooterPage` does that. The footer is `sticky bottom-0` and sits after the page content, so the page uncovers it as the window scrolls.

```tsx
<RevealFooterPage footer={{ wordmark: "Acme", heading: "Ready?", cta: { label: "Start", href: "/start" } }}>
  <main>…</main>
</RevealFooterPage>
```

## Props (`RevealFooter`)

| Prop | Type | Notes |
| --- | --- | --- |
| `wordmark` | `string` | Oversized cropped word |
| `heading` | `string` | CTA heading; omit to hide |
| `cta` | `{ label, href }` | Primary button |
| `columns` | `{ title, links: { label, href }[] }[]` | Link columns |
| `socials` | `{ label, href, icon: LucideIcon }[]` | Icon links |
| `status` | `{ label, live?, href? }` | Status pill with pulsing dot when `live` (default) |
| `legal` | `string` | Copyright line |
| `compact` | `boolean` | Smaller type, tighter spacing |

`RevealFooterPage` takes `children`, `footer` (the props above) and `className`.
