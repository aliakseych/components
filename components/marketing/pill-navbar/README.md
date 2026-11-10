# Pill Navbar

Floating rounded header. The logo mark draws its strokes then fills in, nav items show a pill wash on hover, and menu items open multi-column dropdowns (fade 170ms) with a hover bridge, hover intent delays (140ms open, 220ms close) and arrow-key navigation. At `compactAt` px and below (default 900) the nav hides behind a Menu/Close button and dropdowns open inline. The shadow deepens after scrolling 120px.

```tsx
<PillNavbar
  brand={{ name: "Acme", href: "/", paths: ["M4 4h16v16H4z"] }}
  items={[
    { label: "Pricing", href: "/pricing" },
    { label: "Product", columns: [{ heading: "Product", links: [{ label: "Boards", href: "/boards", description: "Plan together", icon: PenTool }] }] },
  ]}
  actions={[{ label: "Log in", href: "/login" }, { label: "Sign up", href: "/signup", primary: true }]}
/>
```

- `brand.paths`: SVG path data on a 24×24 grid; each path is animated in turn.
- `align: "center"` centres a dropdown under its trigger (use for items near the right edge).
- `fixed` pins the bar to the viewport top; off by default.
- `defaultOpen` / `defaultExpanded` render open states (previews, docs).
- `brandMenu` adds a menu that opens while hovering the logo (hover devices), or with ArrowDown on it.
- `sections` (3 or more) enable the "on this page" mode: past 60% of the viewport the wordmark, nav and secondary actions fold away, the pill narrows, and a chip shows the current section, a progress bar and a jump menu (hover or click), plus a scroll-to-top button. `defaultFolded` keeps it folded for previews.
- `tools` are icon buttons pinned right with a tooltip from `label`; hidden at 1000px and below.
- Escape closes and returns focus; clicks outside and focus leaving the bar close it. Animations stop under reduced motion.
- Non-primary actions are hidden in compact mode.
