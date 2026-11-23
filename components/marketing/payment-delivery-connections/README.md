# Payment & Delivery Connections

Light section: heading and lead, three alternating image/text rows (the last can carry a "Roadmap" badge) and a masked, infinitely scrolling logo marquee. Rows and heading reveal on scroll (gsap, y 48/56, `power3.out`); the marquee runs `marqueeDuration` seconds per loop, pauses on hover and stays still with `prefers-reduced-motion`.

```tsx
<PaymentDeliveryConnections
  title="Payments and delivery your customers already use."
  rows={[{ eyebrow: "Payments", title: "Cards at checkout", visual: <CardsVisual /> }]}
  logos={[{ name: "Ledger", width: 65 }]}
/>
```

- Uses `bg-background` / `text-foreground` tokens, so `dark:` works; `colors` sets `--pdc-*` for the illustrations.
- `logos` accept `src` or fall back to a neutral `LogoMark`; the list is repeated to fill any width.
- Needs `gsap` (ScrollTrigger).
