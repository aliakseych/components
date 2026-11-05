# Roadmap

One set of features shown as switchable Gantt, calendar, list, kanban and table views.

## Exports

`Roadmap`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Changes from the Kibo block

- Takes `statuses`, `defaultFeatures` and `markers` as props, rather than generated fake data.
- All five views share one set of features, so a change in one view appears in the others.
- Logging was replaced with callbacks such as `onViewFeature` and `onFeaturesChange`.

Install every component listed under `composes` in `meta.json`.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
