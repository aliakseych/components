# Phone Split Feature

Text column (heading, description, divider-separated icon bullets, pill button) beside a 456px gradient panel holding a phone. Phone screen content is the `phone` prop. At 1200px and wider the panel is 456px and the gap 84px; 801-1199px it is 40% wide; at 800px and below it stacks with the panel after the text.

```tsx
<PhoneSplitFeature
  title="All your tools, one view."
  description="See everything connected, and what needs attention."
  bullets={[{ icon: <Plug />, text: "One place for every system" }]}
  cta={{ label: "Book a call", href: "/book" }}
  phone={<PhoneListScreen heading="Systems" rows={[{ title: "Accounting", meta: "Updated 2 min ago" }]} />}
/>
```

- `reversed` puts the panel first on wide screens.
- `phonePosition`: `"top"` hangs the phone 12.28% below the top edge; `"bottom"` shows only the lower part of a phone that starts 59.4% above the panel (use `PhoneListScreen anchor="bottom"`).
- `parallax` (default 24) is the max px the phone drifts: scroll progress is eased 12% per frame.
- Entrance: heading 0ms, description 80ms, bullets 160ms + 60ms each, button 340ms (800ms, 18px rise); the panel takes 1000ms with a 32px rise and 0.96 scale; fires once at 35% from the viewport bottom. Reduced motion disables the entrance and the parallax.
- `PhoneListScreen` is an optional ready-made screen scaled with container units.
