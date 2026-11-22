# Silk Road Tours Landing

Tour operator landing in Uzbek national style: sunrise intro, adras hero, an interactive globe of the route, plan-your-trip doors, legal documents and a contacts footer.

```bash
pnpm install && pnpm dev
```

## Sections

- **Intro**: the sun rises, its rays grow, the wordmark wipes in and the lockup flies into the nav; the adras curtain lifts. Any key, click or scroll skips it.
- **Nav**: glass pill with section links, a language sheet and a mobile menu.
- **Hero** (`#top`): headline and two CTAs on the adras texture.
- **Journey** (`#journey`): full-screen library `InteractiveGlobe` (`src/components/interactive-globe/`, wired in `src/components/landing/journey.tsx`) zooming into Uzbekistan on Sentinel-2 imagery; each city flies in on its own satellite tile and opens a panel with craft cutout, photo, highlights, best-time chart and attractions; an attraction opens a photo slider and full-size viewer.
- **Plan** (`#plan`): two doors to your travel-info and contacts pages.
- **Legal** (`#trust`): three document cards (placeholder sheets) and a link to all documents.
- **Footer**: company details, staff contacts, links, languages and the photo credits dialog.

## Change it

- Brand, company, staff, documents, page links and languages: `src/template.config.tsx`.
- Copy: `src/sample/content.ts`.
- Places, photos and credits: `src/sample/journey.json`, `src/sample/media/`, `src/sample/media-manifest.json`. Photo keys resolve to `media/<key>-640.webp` and `-1280.webp`.
- Logo: replace `src/components/landing/sun-mark.tsx`.
- Colours: tokens in `src/index.css`; dark mode is `.dark` on `<html>`.

## Limits

- English only; language links point at placeholder routes for your i18n setup.
- Plan doors, document cards and the "All documents" link point to pages and PDFs you add.
- The globe needs JS and canvas; there is no static fallback list. Attraction markers use the library pin, so the site's kind icons appear in the panel list instead.
- Map imagery: EOX Sentinel-2 cloudless 2016 (CC BY 4.0); city photos from Wikimedia Commons under their listed licences.
