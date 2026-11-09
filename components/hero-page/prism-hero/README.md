# Prism Hero

Inspired by https://21st.dev/@rahil1202/components/prisma-hero; independently written.

A full-screen hero with a floating navbar, a word-by-word headline reveal and a call to action. The background is CSS only, built from theme tokens.

```tsx
import { PrismHero } from "@/components/hero-page/prism-hero";

<PrismHero
  brand="Prism"
  navItems={[{ label: "Our story", href: "#story" }]}
  headline="Stories that refuse to stay on the page."
  body="A studio of filmmakers and storytellers."
  cta={{ label: "Join the lab", href: "#join" }}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `brand` | `string` | `"Prism"` | Shown at the left of the navbar. |
| `navItems` | `{ label: string; href: string }[]` | `[]` | Four links suit the pill; they hide below `md`. |
| `headline` | `string` | placeholder | Each word animates in. Reduced motion shows it at once. |
| `body` | `string` | placeholder | Shown bottom left. |
| `cta` | `{ label: string; href: string }` | | Pill link with an arrow, bottom right. |
| `menuLabel` | `string` | `"Open menu"` | Accessible name of the icon button. |

Other section props are passed through, including `className`.

## Origin

Inspired by https://21st.dev/@rahil1202/components/prisma-hero; independently written.
