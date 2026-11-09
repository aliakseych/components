# Hills Footer

Inspired by https://21st.dev/@kedhareswer/components/meadow-rise-footer; independently written.

A footer with a call to action over a canvas landscape. The scene paints a sky gradient, a sun glow, four layers of rolling hills and drifting mist. The hills are generated from a seed, so no image files are needed. It paints only its own section, not the page background. Below the scene: an optional brand link, a newsletter field, social icon links and link columns.

```tsx
import { HillsFooter } from "@/components/marketing/hills-footer";

<HillsFooter
  headline="Take the first step with Harbor today."
  accent="first step"
  cta={{ label: "Contact support", href: "/contact" }}
  columns={[{ title: "Product", links: [{ label: "Pricing", href: "/pricing" }] }]}
  onSubscribe={(email) => console.log(email)}
/>;
```

## Motion

- **Load:** the scene starts when 12% of it is visible. Hill layers rise one after another, a sky-coloured cover fades out, the sun fades in, mist follows, and a horizon hairline expands and fades. The headline words slide up, then the intro, CTA, columns and newsletter fade in.
- **Pointer:** the hills and sun move with the pointer, with the far layers moving least. The scene eases back when the pointer leaves. Mist drifts all the time.
- **Hover:** links slide and change colour, the CTA fill sweeps in and its arrow swaps, and the brand logo turns.
- **Newsletter:** the field has a focus underline. An invalid email shakes the field and shows an inline message. The browser's own validation bubble is off.
- **Reduced motion:** the scene renders its final state, with no parallax, drift, rise or hover movement.

The scene uses a `<canvas>` and runs its frame loop only while it is on screen.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `headline` | `string` | required | Headline text, split into words for the entrance. |
| `accent` | `string` | | A phrase inside `headline` shown in Geist italic. |
| `intro` | `string` | placeholder | Line under the headline. |
| `cta` | `{ label: string; href: string }` | "Contact support" | Pill link with an arrow. |
| `brand` | `{ label: string; href: string; logo?: ReactNode }` | | Optional brand link above the newsletter. `logo` defaults to a small sun-and-hill mark. |
| `columns` | `{ title: string; links: { label: string; href: string }[] }[]` | placeholder columns | Link columns. |
| `social` | `{ label: string; href: string; icon: LucideIcon }[]` | three placeholder icons | Each needs an accessible `label`. |
| `onSubscribe` | `(email: string) => void` | | Called with the trimmed email when it is valid. |
| `seed` | `number` | `7` | Changes the hill shapes. |
| `colors` | `Partial<{ sky; skyBottom; sun; hills: string[]; mist }>` | theme tokens | CSS colours, including `var(--chart-n)`. `hills` runs far to near; use four entries. Values are resolved from the theme and re-read when the theme changes. |

Other footer props are passed through, including `className`.

## Origin

Inspired by https://21st.dev/@kedhareswer/components/meadow-rise-footer; independently written.
