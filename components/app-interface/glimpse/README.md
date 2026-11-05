# Glimpse

A hover card that previews a linked page, with a server helper that reads its title, description and image.

## Exports

`Glimpse`, `GlimpseContent`, `GlimpseTrigger`, `GlimpseTitle`, `GlimpseDescription`, `GlimpseImage`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Fetching a preview

`server.tsx` exports `glimpse(url)`, which fetches a page and returns its title, description and image. Run it only on a server, and only for URLs you trust, because it fetches whatever URL it receives.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
