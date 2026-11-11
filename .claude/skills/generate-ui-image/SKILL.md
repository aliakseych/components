---
name: generate-ui-image
description: Use when a component, demo or landing page needs generated raster art from the ChatGPT image model — corner watermarks, emblem/seal backgrounds, hero art, parallax sprite layers (clouds, hills, objects), day/night pairs, or frame sequences for simple animations.
---

# Generate UI images and animation layers

Images come from the GPT Image model (`openai-codex/gpt-image-2`) through the `generate_image` tool (`xd://generate_image`) or the `ui-image` agent. The model makes still images only. Motion comes from CSS or `motion` animating the layers you generate.

Generated art is content, so the component never hard-codes it. The component takes `src`/`image` props. The generated files go into the demo that uses them, or into the app's `public/`.

## 1. Pick the kind of asset

| Kind | Example | How it is used |
| --- | --- | --- |
| Corner watermark | A national emblem in the top-right corner of a law card, at about 15% opacity | `absolute -right-6 -top-4 size-40 opacity-15`, plus a mask that fades it into the card |
| Emblem or seal | An embossed grey crest or stamp | The same, with `mix-blend-multiply` (light theme) or `mix-blend-screen` (dark theme) |
| Sprite layer | One cloud, hill or planet, on a transparent background | Several copies at different sizes and speeds make a parallax sky (as on cloudlet.dev) |
| Day/night pair | The same sprite lit for the light theme and for the dark theme | Two `<img>` tags, with `dark:hidden` on one and `hidden dark:block` on the other |
| Material wordmark | A brand word made of clouds, smoke or glass | A footer or hero centerpiece. Real text sits on top of it as `sr-only` or as a caption |
| Frame sequence | The same object in 4–8 poses | Swap frames with CSS `steps()`, or crossfade them on scroll |

## 2. Write the prompt

Fill in the `generate_image` fields:

- `subject`: one object, described concretely. For example: "the state emblem of Uzbekistan as an embossed paper relief".
- `style`: for watermarks, use "monochrome light-grey embossed relief, soft engraved shading, no color, no text". For sprites, use "photoreal soft volumetric cloud" or "flat vector".
- `composition`: "single isolated object, centered, generous empty margin, nothing touching the edges".
- `scene`: "on a pure white #FFFFFF background" or "on pure black #000000". Choose whichever background is the opposite of the object, so it can be keyed out later.
- `lighting`: "soft top-left light" for every layer of a set, so all the layers match.
- `aspect_ratio`: `1:1` for corner marks and sprites, `16:9` or `3:2` for hero art and wordmarks.
- Text inside images is unreliable. Ask for "no text" unless the text is the whole point. For a wordmark, put the exact word in `text` and ask for it "sharp, legible, correctly spelled".

To make a set (cloud-1 to cloud-6, or day and night versions), generate the first image, then pass it as `input` with `changes`, for example `["same style and lighting, different cloud shape"]` or `["same object relit as moonlit night, darker, blue tint"]`. This keeps the whole set consistent.

Real emblems, logos and trademarks: generate them only for the brand's own product, or for a demo. Otherwise ask for a generic, invented crest.

## 3. Turn it into a web asset

The tool has no transparency option, so key out the solid background with ImageMagick. Then resize and convert to WebP:

```bash
# white background → alpha (for a dark object on white)
magick in.png -fuzz 8% -transparent white -trim +repage -resize 800x800 out.png
# grey relief watermark: luminance becomes alpha, so the light paper disappears
magick in.png -colorspace gray -negate -alpha copy -fill '#000' -colorize 100 -trim +repage wm.png
# black background → alpha (for a glowing or light object on black)
magick in.png -fuzz 8% -transparent black -trim +repage out.png
cwebp -q 82 -alpha_q 90 out.png -o out-800.webp
```

- Make watermarks single-channel, so the component can tint them with `bg-current` and a CSS mask, which works with any theme color:
  ``style={{ maskImage: `url(${src})` }}`` plus `mask-size: contain; mask-repeat: no-repeat` on an element with `bg-foreground/10`.
- Keep files small. A sprite should be 800px on its longest side or less and about 60 KB or less. A corner mark should be 400px.
- Check the result with `read` on the PNG, both over the light and the dark gallery background.

## 4. Animate the layers

- **Drift.** Give each copy of a sprite its own `animation: drift <20–60s> linear infinite` with a different `animation-delay`, translating X across the band. Put the smaller, slower and more transparent copies further back.
- **Parallax.** Use `useScroll` + `useTransform` from `motion` (`y` from 0 to −40px for near layers, about −10px for far ones). Or use a scroll-driven CSS `animation-timeline: scroll()` where it is supported.
- **Breathing watermark.** Animate `opacity` from 0.10 to 0.16 and `scale` from 1 to 1.03 over 6s, or do it only on card hover: `group-hover:opacity-20 group-hover:-rotate-3 transition-[opacity,transform] duration-500`.
- **Frames.** Put the frames side by side into a strip (`magick f*.png +append strip.webp`). Then use `background-position` with `steps(N)`.
- Always honour `motion-reduce:` / `useReducedMotion()`: keep the art, stop the motion.

## 5. Ship it

- Put the art for a demo in `components/<category>/<slug>/demos/`, and import it so Vite bundles it: `import emblem from "./emblem.webp"`.
- Never put generated art in `previews/`, which holds the generated screenshots.
- Record the prompt in the component's README under "Art". Regenerating the art should be a single tool call.
- Run `pnpm run capture <slug>`, then look at both themes. A watermark must not reduce text contrast. Keep it behind the text, and keep the text at full opacity.
