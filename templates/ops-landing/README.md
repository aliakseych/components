# Ops Assistant Landing

A full marketing landing page for an operations assistant, built from the library's marketing sections and laid out section by section after a reference site. Light and dark themes (toggle `.dark` on `<html>`).

```bash
pnpm install
pnpm dev
```

## Sections

Header that turns into a floating pill, sky hero whose phone scrolls through a chat, inline-image headline, phone feature tabs, integration grid, two phone split sections, chat testimonials, setup steps, FAQ, night CTA with footer, and a manifesto dialog (header link, pill link or footer link; `/?manifesto=1` opens it on load).

## Change it

- Brand, CTA, contacts, socials, footer tagline: `src/template.config.tsx`
- Manifesto text: `src/sample/manifesto.ts`
- Section copy and sample screens: props passed to `OpsLanding` in `src/app.tsx` (each section takes overrides), defaults in `src/components/marketing/ops-landing`
- Theme tokens: `src/index.css`

`src/components/` holds copies of library components (`components/<category>/<slug>` in the library); re-copy them to pick up library fixes.

## Limits

Static page with no backend: the CTA links are anchors. Brand, copy, photos and phone screenshots of the reference site are not included; the phones render live React screens instead.
