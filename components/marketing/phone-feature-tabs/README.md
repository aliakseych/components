# Phone Feature Tabs

Expandable capability list synced to a carousel of 313x640 phone screens. Desktop: the active row expands (360ms FLIP, description fades 260ms, outgoing text slides up 4px), phones move 560ms `cubic-bezier(.4,0,.2,1)` between front, peeking rear (x 195, scale .89375, opacity .6) and off-stage poses; non-adjacent jumps crossfade in 320ms. At 800px and below: phone above, chips below; choosing a chip expands a summary with prev/next arrows and a close button, animating panel height 420ms. Arrow keys, Home and End move between rows. Animations are skipped for keyboard selection and reduced motion.

```tsx
<PhoneFeatureTabs
  heading={<>One assistant for<br />your whole operation.</>}
  defaultIndex={1}
  items={[{ title: "Briefs", description: "Your day at a glance.", screen: <MyScreen /> }]}
/>
```

- `items[].screen` is any ReactNode. It fills the 280x609 screen cutout of the 313x640 phone frame image (`assets/iphone-frame.webp`); the frame's island covers the top centre, so keep about 48px of top padding.
- `heading` is optional; the component fills its container width.
- The panel and heading fade up once on scroll (heading 800ms/18px, panel 1000ms/32px with scale .96, `cubic-bezier(.25,.1,.25,1)`, trigger 35% above viewport bottom); skipped under reduced motion.
