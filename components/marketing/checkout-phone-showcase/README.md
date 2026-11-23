# Checkout Phone Showcase

Centred heading over a black 1260×504 scene that loops for 8 s: product grid, "Add to cart" card, checkout card, the thumbnail floating into a phone, then a sale notification on the lock screen. The scene is CSS keyframes scaled to the container, so nothing is a video. On scroll it rises from 120px (gsap `power3.out`, 1.3 s), drifts −40px with a scrubbed parallax, and plays only while in view.

```tsx
<CheckoutPhoneShowcase title="Accepting payment is easy" description="All you need is a bank account." />
```

- `products` (4: name, price, rating, `kind` tee / plaid / raglan / jeans), `labels`, `category`, lock-screen date/time and `notification` replace the neutral copy.
- `colors` sets `--cps-*` variables (stage, glow, wallpaper).
- With `prefers-reduced-motion` the scene shows a still frame (phone up, notification visible) and no gsap runs.
- Needs `gsap` (ScrollTrigger).
