# Admissions Assistant Landing

A calm, editorial marketing landing for a college application assistant, laid out section by section after a reference site. Olive palette, serif headlines, noise-gradient frames holding small product screens built in code. Light and dark themes (toggle `.dark` on `<html>`).

```bash
pnpm install
pnpm dev
```

## Sections

Sticky header with keyboard dropdown menus (Tools, Explore) and a full-screen mobile menu dialog (`/?menu=1` opens it on load), serif hero with a dashboard mock, scrolling school wordmark marquee, six feature cards with live mock UIs (timeline, scholarships, essay review, admitted essay, rewrite, final pass ring), FAQ accordion on native `<details>`, centred CTA and a six-column footer.

## Change it

- Brand name, wordmark, header CTA, legal line: `src/template.config.tsx`
- All copy and mock data (nav, hero, dashboard, schools, features, FAQ, CTA, footer): `src/sample/content.ts`
- Palette, fonts, noise grain and marquee motion: `src/index.css`
- Sections: `src/components/`

## Limits

Static page with no backend: links are anchors. School names are fictional and rendered as type wordmarks; replace them with logos you have rights to. The marquee stops (and wraps on wider screens) under `prefers-reduced-motion`. Fonts use the system stack (Iowan Old Style on Apple devices) rather than licensed web fonts.
