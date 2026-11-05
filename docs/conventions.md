# Component conventions

## Folder layout

```text
components/<category>/<slug>/
├── index.tsx    # Public exports
├── meta.json    # Searchable description
├── README.md    # Usage, props, origin and caveats
├── demos/       # One default-exported state per file
└── previews/    # Generated screenshots
```

Categories and slugs use kebab-case. Slugs are unique across the whole library.

## Component code

- Use named exports and export the props type.
- Accept and forward native props where the component wraps a native element, including `className`.
- Pass content and data through props. Don't hard-code app data or fetch it inside the component.
- Style with Tailwind and support the `dark:` variant.
- Use semantic elements, visible keyboard focus, and accessible names.
- Respect `prefers-reduced-motion` for non-essential animation.
- Fit a 390px-wide screen without horizontal scrolling.
- Keep imports inside the component's folder, and keep helpers beside `index.tsx`. The exceptions are `@/lib/utils`, shadcn parts declared in `meta.shadcn`, and library components declared in `meta.composes`.

## Visual style

Everything follows the dashboardblocks look, except the prompt bar and hero page components, which keep their own.

- Fonts: Geist for text and Geist Mono for code and IDs, with tabular numbers for figures.
- Surfaces: `bg-card`, `border`, `rounded-xl` and light shadows. Use `text-muted-foreground` for secondary text.
- Colors: theme tokens from `gallery/styles.css` only. Chart series use `chart-1` to `chart-5`. Colors passed in as data are the exception.
- Every number that has a graphic must drive that graphic.

An app using these components needs the same tokens, including `--chart-1` to `--chart-5`.

## Vendored source

These trees hold vendored source. They are not library components and must never get a `meta.json`:

- `components/ui/`: shadcn parts
- `components/dashboardblocks/`: the free dashboardblocks registry. Its files import each other.
- `components/icons/`
- `hooks/`
- `lib/`

`VENDORED` in `scripts/lib.mjs` lists these names. A library component in a category folder may wrap vendored code. Its `index.tsx` re-exports from the vendored path, for example `@/components/dashboardblocks/<family>/<name>`.

## Demos

Each file in `demos/` shows one meaningful state with realistic content. The file name becomes the demo's name in the gallery and its screenshot names. Capture records the resting state, so add a demo that renders hover, open or error states directly when they matter.

## Previews

`pnpm run capture` writes `<demo>.<desktop|mobile>.<light|dark>.png`. Commit these files so agents can compare components without starting the gallery.
