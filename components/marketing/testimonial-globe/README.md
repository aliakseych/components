# Testimonial Image Wheel

A testimonial block. A header shows an eyebrow, a headline, a stats row (review count, average rating, unique country count) and a "Read all reviews" call to action. Below it, a ring of avatars turns slowly. The active review's avatar sits beside its quote, with the name, role and country.

Selecting an avatar, by click or by Enter or Space, flies the previous avatar back to the ring and lifts the new one out to the text. The new avatar gets a thicker ring and a pulsing halo. The review also advances on its own every six seconds. Hovering the ring or keyboard-focusing an avatar pauses the rotation and the auto-advance.

On mount, the avatars fly in from the text position into the ring as a staggered carousel.

```tsx
import { TestimonialImageWheel, type TestimonialReview } from "./index";

const reviews: TestimonialReview[] = [
  {
    id: "ines",
    name: "Ines Duarte",
    role: "Head of Support",
    country: "Portugal",
    quote: "Our support queue halved in the first month.",
    initials: "ID",
    rating: 5,
  },
];

<TestimonialImageWheel reviews={reviews} href="/reviews" />;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `reviews` | `TestimonialReview[]` | required | `{ id, name, role, country, quote, initials, color?, rating? }` |
| `eyebrow` | `string` | `"Trusted on every continent"` | Small line above the headline |
| `headline` | `string` | Placeholder headline | Main heading |
| `ctaLabel` | `string` | `"Read all reviews"` | Call to action text |
| `href` | `string` | none | Makes the call to action a link. Takes priority over `onReadAll` |
| `onReadAll` | `() => void` | none | Click handler when there is no `href` |
| `autoAdvanceMs` | `number` | `6000` | Milliseconds before the next review is selected. `0` disables it |
| `rotationSeconds` | `number` | `60` | Seconds for one full turn of the ring |
| `size` | `number` | `260` | Outer diameter of the ring in px |
| `colors` | `string[]` | `var(--chart-1)` to `var(--chart-5)` | Ring colours, cycled across avatars. A review's `color` overrides its slot |
| `haloColor` | `string` | `var(--primary)` | Halo around the active avatar |

`rating` is optional. When every review has one, the stats row shows the average to one decimal. The countries figure counts unique `country` values.

The colours are set as CSS custom properties on the root. The component paints no background, so the page or the wrapper behind it must provide one. It forwards other native props to the `section`.

## Motion

- The ring rotates with a CSS keyframe. Each avatar counter-rotates, so it stays upright.
- Flights run on `requestAnimationFrame` and follow the ring while it turns. They use a cubic bezier that matches `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- With `prefers-reduced-motion: reduce`, the ring stays still, the intro is skipped and avatars change instantly. The text and selection still work.

## Install in an app

Copy the folder into the app and add the shadcn `button` part listed in `meta.json`.
