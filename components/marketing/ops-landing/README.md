# Ops Landing

A full landing page composed from library sections, in this order: header, hero, headline, feature tabs, integrations, two split features (second reversed), testimonials, setup steps, FAQ, CTA footer.

The header's `boundary` is the hero's `endRef`, so the pill appears once the hero ends.

```tsx
<OpsLanding faq={{ title: "Questions" }} cta={{ title: "Talk to us" }} />
```

Each prop (`header`, `hero`, `intro`, `features`, `integrations`, `splitPrimary`, `splitSecondary`, `testimonials`, `setup`, `faq`, `cta`) is spread over the section's defaults. Replace copy through them. Sections without a component on the source site: none; the manifesto dialog is not included.
