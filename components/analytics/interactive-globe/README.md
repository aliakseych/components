# Interactive Globe

A canvas globe that flies in to highlighted countries or regions, with satellite imagery, focusable markers and a liquid glass popover per marker.

## Exports

`InteractiveGlobe`, `GlobePopover` and the types `GlobeMarker`, `GlobeView`, `GlobeHighlight`, `GlobeSatellite`, `InteractiveGlobeColors`, `InteractiveGlobeProps`, `GlobePopoverProps`, `GeoBounds`.

## Usage

```tsx
<InteractiveGlobe
  markers={[{ id: "kyoto", lat: 35.01, lng: 135.77, title: "Kyoto", description: "Former imperial capital", href: "/kyoto" }]}
  highlight={["Japan"]}
  satellite
  onMarkerSelect={(m) => console.log(m?.id)}
  className="h-[32rem]"
/>
```

- `highlight`: countries by ISO 3166-1 numeric id (`"392"`) or Natural Earth name (`"Japan"`), or `{ id, geometry }` with any GeoJSON geometry for provinces or custom areas.
- `initialView` / `zoomTo`: `{ lat, lng, zoom }`, where zoom 1 fits the whole globe. The camera flies from `initialView` to `zoomTo` once 40% of the globe is on screen, and again when `zoomTo` changes. `zoomTo` defaults to fitting the highlights.
- `satellite`: `true` loads one keyless Sentinel-2 cloudless 2016 image (EOX, CC BY 4.0) for the highlighted area and fades it in once zoomed in; pass `{ bounds, src, attribution }` for your own Web Mercator image or tile service. Skipped on save-data and 2G connections.
- `selectedId` / `defaultSelectedId` / `onMarkerSelect`: controlled or uncontrolled selection.
- `colors`: `water`, `land`, `border`, `highlight`, `outline`, `graticule`, `marker`, applied as `--interactive-globe-<role>` (theme tokens by default; the canvas re-reads them on theme change).

Drag rotates, ctrl/⌘ + wheel and pinch zoom, the buttons zoom and reset. On touch a finger rotates only once zoomed in, so the page still scrolls. Markers are buttons: Enter opens the popover and moves focus into it, Esc or the close button closes it and returns focus to the marker. The popover sits above the marker (below when there is no room) and stays inside the globe box and the viewport. With `prefers-reduced-motion` the camera jumps instead of flying.

## Data

Borders are Natural Earth 1:110m from world-atlas 2.0.2 (public domain; ISC), bundled in `countries-data.ts` (about 100 KB) as delta-encoded rings. Countries named in `highlight` switch to their 1:50m outline from `countries-50m.ts`, a lazily imported chunk (about 140 KB gzipped) loaded only when a named highlight is used. Satellite imagery is clipped to the highlighted shapes. For other areas pass your own geometry to `highlight`.

## Origin

Ported from the journey map of yairatour: the d3-geo canvas orthographic globe, the fly-in on first view, the highlighted country, the Mercator satellite raster drawn through the projection in affine cells, decluttered pins with leader lines, and drag, pinch and ctrl + wheel zoom. Generalised to any countries, markers and imagery, with one glass popover in place of the site's side panel.
