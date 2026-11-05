# Collaborative Canvas

A dotted canvas with collaborator avatars and labeled cursors, including an optional simulated motion mode.

## Exports

`CollaborativeCanvas`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Changes from the Kibo block

- Takes `users` as a prop, with positions you can update from live data.
- Random movement is now the optional `simulate` prop, and it respects reduced motion.
- Replaced `next/image` so it works outside Next.js.

It shows presence only. Add your own realtime sync and drawing.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
