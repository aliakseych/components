# Floating Menu

Inspired by https://21st.dev/@aayush-duhan/components/liquid-morph-floating-menu; independently written.

A pill at the bottom centre of its container. Closed, it shows a label and a menu icon. Opened, it widens into a panel of links, and the icon turns into a close icon. Escape closes it and returns focus to the toggle.

```tsx
import { Home, Settings2 } from "lucide-react";
import { FloatingMenu } from "@/components/app-interface/floating-menu";

<div className="relative h-80">
  <FloatingMenu
    label="Menu"
    items={[
      { label: "Home", href: "/", icon: Home },
      { label: "Settings", href: "/settings", icon: Settings2 },
    ]}
  />
</div>;
```

Place it in a `fixed inset-0` wrapper to float over a page. The root is `absolute`, so the nearest positioned ancestor sets where it sits.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ label: string; href: string; icon?: LucideIcon }[]` | | Links in the panel |
| `label` | `string` | `"Menu"` | Text in the closed pill and the nav's accessible name |
| `defaultOpen` | `boolean` | `false` | Starts open |
| `className` | `string` | | Positions the wrapper; also accepts every other `div` prop |
| `colors` | `{ surface?, text?, muted? }` | theme tokens | Colour roles, see Theming |

With `prefers-reduced-motion: reduce`, the pill and icons change without transitions.

## Theming

`colors`: `surface` (pill and panel, default `var(--foreground)`), `text` (label, icons and links, default `var(--background)`), `muted` (hover tint, default `var(--background)`). They are set on the root as `--floating-menu-*`. The page background is not painted, so put the stage behind the menu.

## Origin

Inspired by https://21st.dev/@aayush-duhan/components/liquid-morph-floating-menu; independently written.
