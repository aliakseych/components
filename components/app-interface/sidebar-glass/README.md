# Glass Sidebar

The `ihsp-web` sidebar: a floating glass rail that collapses to icons and becomes a sheet on phones. For the plain shadcn version, use `app-interface/sidebar`.

```tsx
import { GlassSidebar, GlassSidebarProvider, SidebarBrand } from "./sidebar-glass";

<GlassSidebarProvider storageKey="app.sidebar">
  <GlassSidebar
    brand={<SidebarBrand logo={<Logo />} name="Campus" />}
    footer={<AccountRow />}
    nav={nav}
    pathname={pathname}
    renderLink={(props) => <Link {...props} />}
  />
  <main>{children}</main>
</GlassSidebarProvider>;
```

## What it adds to the basic sidebar

- A glass panel with rounded corners, which falls back to solid when blur is unavailable or reduced transparency is requested.
- Pill-shaped rows whose icons stay still while the rail collapses.
- A logo that doubles as the toggle.
- A nav data model with groups, nested items, badges, external links and `prefix` or `exact` active matching.
- `filterNavGroups(groups, roles)` for role-based menus.
- Optional localStorage persistence through `storageKey`.

## Changes from ihsp-web

- `next/link` and `usePathname` became the `renderLink` and `pathname` props, so it works with any router.
- App translations and the shared icon registry were removed. Pass `toggleLabel` and icon components yourself.
- Glass styles moved from the global theme into `glass.css`. This also approximates the app's `rounded-panel` token as `1.25rem`.
- Base UI `render` props became Radix `asChild`.
- The bottom navigation bar was not included.

Glass only shows over content or a background that sits behind the sidebar. Over a flat color, it looks solid.

## Origin

Adapted from `ihsp-web` (`packages/ui/src/components/layout`).
