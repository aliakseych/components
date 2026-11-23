# Merchant Platform Landing

A full marketing landing for an e-commerce platform: hiding header with mobile menu, hero with rotating eyebrow and floating collage, theme fan strip, two animated product demos, integrations with a logo marquee, advantage grid, testimonial wipe, comparison table, blog, FAQ, lead form, footer and consent banner. Brand, copy, logos and imagery are neutral placeholders.

## Sections

- `site-header`, `hero`, `design-strip`, `testimonial`, `found-in-search`, `compare`, `blog`, `faq`, `closing-cta`, `site-footer`, `consent-banner` — page chrome and content sections.
- `product-showcase` — "Make your products shine" demo loop.
- `accepting-payment`, `payment-delivery`, `run-every-channel` — each lives in its own folder so it can be swapped for a library copy.

Motion is GSAP (ScrollTrigger reveals, scrubs, loops). Demo loops play only while on screen. Under `prefers-reduced-motion` nothing animates and the demos rest on a final frame. Light and dark themes switch with the `.dark` class; white sections use theme tokens, dark sections stay dark.

## Change it

- Brand, nav, contacts, social links: `src/template.config.tsx`.
- Copy: `src/sample/content.ts`.
- Imagery and partner logos: `src/sample/art.tsx`.
- Tokens and dark values: `src/index.css`.
- Lead form submits locally; wire `onSubmit` in `closing-cta`. Consent choice is kept in `localStorage`; replace `save` in `consent-banner`.
- The consent banner shows only with `?consent=1` (the `consent` screen).

## Limits

- The two demo animations are timelines rebuilt from a reference, not video.
- Not responsive-tested below 360px.
