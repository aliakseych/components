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
- Theming: a component with its own palette (glows, scenes, highlights, series) takes an optional `colors` prop, an object of named roles. Apply it on the root as CSS custom properties (`--<slug>-<role>`) with theme-token defaults, and read those vars inside. No hex literals.
- Background: a component paints only its own surfaces. Page background, stage colour and page height belong to the demo wrapper or the app, never to the component root.

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

## Templates

A template is a whole app to start a project from, not a component to import. It lives in `templates/<slug>/` and is its own project:

```text
templates/<slug>/
├── template.json   # Name, summary, tags, stack, screens to preview
├── README.md       # How to run it, what to change, limits
├── package.json    # Runs on its own: pnpm install && pnpm dev
├── index.html, vite.config.ts, tsconfig.json
├── src/
│   ├── main.tsx            # Standalone entry
│   ├── preview.tsx         # Gallery entry: export mount(element, { path, theme })
│   ├── template.config.tsx # Brand, formats, API mode and sample data
│   └── sample/             # Sample data; never real brands, logos, people or companies
├── server/         # Optional backend the app can talk to
└── previews/       # Generated: <screen>.mobile.<theme>.png
```

- Inside a template, `@/` means its own `src/`. The gallery resolves that per template, and each template is type-checked with its own `tsconfig.json`.
- A template must run without a server on sample data, so it can be previewed. Stub what needs a backend behind the same API calls the real server answers.
- Keep brand, logos and data in `template.config.tsx` and `src/sample/`, with neutral placeholders as defaults. Keep the product logic, including AI code.
- List each screen to preview in `template.json` (`id`, `title`, `path`). `pnpm run capture <slug>` takes one phone screenshot per screen and theme in `themes`.
- Add its third-party packages to the root `package.json` too, so the gallery can render it.
