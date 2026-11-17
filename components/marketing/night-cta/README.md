# Night CTA

596px rounded card (540px under 800px) over a background image darkened with `brightness(.88) contrast(1.12)`. The default image is a dawn skyline drawn in SVG. Under 800px the background-position is recomputed on resize so `focalX` (default `.744`) stays centred, clamped to the image edges. Optional footer: wordmark, tagline, link columns (156px each, 2-up on mobile) and a legal line.

```tsx
<NightCta
  badge="Trusted by growing teams"
  title="Discover what Relay can lift off your desk."
  actions={[{ label: "Book a call", href: "/book" }, { label: "hi@acme.com", href: "mailto:hi@acme.com", variant: "ghost" }]}
  footer={{ brand: "Relay", columns: [{ heading: "Legal", links: [{ label: "Privacy", href: "/privacy" }] }], legal: "© 2026 Acme" }}
/>
```

- `image` replaces the scene; `focalX` is the subject's horizontal position as a fraction of its width.
- Footer links take `href`, `onClick` (renders a button), plain text, an `icon`, and `external`.
- The proof badge wings are inline SVG marks.
