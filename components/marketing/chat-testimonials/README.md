# Chat Testimonials

Quotes as chat bubbles (36px radius, tail at the lower left), a company badge underneath, and prev/next chevrons. The track translates by one card stride, clamped to the scrollable width, over 600ms with `cubic-bezier(.4,0,.2,1)`. Arrow keys on the focused region jump without animation; a horizontal drag over 45px swipes. Below 800px cards are `100% - 40px` wide (max 540). Reduced motion removes the transition.

```tsx
<ChatTestimonials
  title="What changes when Relay joins the team."
  items={[{ quote: "“Saves me hours.”", author: "Ana · Owner", company: "Northline" }]}
/>
```

- `items[].logo` replaces the initial in the 32px company badge.
- `ariaLabel` names the carousel region.
