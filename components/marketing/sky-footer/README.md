# Sky Footer

Inspired by the sky footer on cloudlet.dev; independently written.

A footer shaped as a sky. Link columns sit at the top, a band of cloud sprites drifts below them, and a giant brand wordmark floats in the middle of the band. Light theme is a day sky; dark theme is a navy night with twinkling stars and moonlit clouds.

```tsx
import { SkyFooter } from "@/components/marketing/sky-footer";

<SkyFooter
  wordmark="Cumulus"
  clouds={[{ day: cloud1Day, night: cloud1Night }]}
  columns={[{ title: "Product", links: [{ label: "Pricing", href: "/pricing" }] }]}
  legal="© 2026 Cumulus Labs"
/>;
```

## Motion

- **Drift:** three cloud layers loop sideways. Far layers are smaller, fainter and slower; the near layer is largest and passes in front of the wordmark.
- **Scroll:** layers rise into place as the footer scrolls into view, near layers moving the most.
- **Pointer:** layers shift slightly away from the cursor, far layers least, with a spring.
- **Wordmark:** bobs gently. It is SVG text run through a `feTurbulence` + `feDisplacementMap` filter for fluffy edges, a noise texture for cloud shading, and a white halo glow.
- **Stars:** dark theme only, pulsing at staggered rates.
- **Reduced motion:** all art stays; drift, parallax, bobbing and twinkling stop.

The wordmark is real SVG text with `aria-label`; clouds and stars are `aria-hidden`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `wordmark` | `string` | required | Giant cloud word. Stretched to fit one line, so keep it short. |
| `columns` | `{ title: string; links: { label: string; href: string }[] }[]` | `[]` | Link columns in a `nav`. Omit for the minimal footer. |
| `legal` | `string` | | Bottom legal line. |
| `clouds` | `{ day: string; night?: string }[]` | `[]` | Transparent cloud images. Without `night`, the day image is dimmed in dark mode. Empty: soft CSS blobs are drawn. |
| `className` | `string` | | Plus native `footer` props. |

The root paints its own sky, so a demo or app only sets width and spacing.

## Art

Sprites in `demos/` are generated with `generate_image` (3:2, pure black background), keyed to alpha by luminance, trimmed, resized to 800px wide, and converted to WebP:

```bash
magick in.webp \( +clone -colorspace gray -level 4%,55% \) -alpha off -compose CopyOpacity -composite -trim +repage -resize 800x out.png
cwebp -q 78 -alpha_q 80 -m 6 out.png -o cloud-1-day.webp
```

- **cloud-1-day:** subject "a single soft fluffy cumulus cloud, wide and flat-bottomed, photoreal volumetric"; scene "isolated on a pure black #000000 background, nothing else"; composition "single isolated object, centered, generous empty margin, nothing touching the edges"; lighting "soft top-left daylight, bright white tops, faint pale grey-blue underside"; style "photoreal soft volumetric cloud, no text".
- **cloud-2-day, cloud-3-day:** `cloud-1-day` as input, changes "same style, lighting and pure black background, different cloud shape" (2: tall puffy towers on the left, trailing wisp on the right; 3: small rounded puffball with a flat base).
- **cloud-N-night:** the matching day image as input, subject "same cloud relit as moonlit night cloud, deep blue-grey body with soft silver-white moonlit edges", changes "same shape and composition, pure black background kept".
