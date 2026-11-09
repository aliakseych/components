# Dithered Footer

Inspired by https://21st.dev/@otatechie/components/dithered-footer; independently written.

A light footer with the brand, a tagline, an email sign-up with its own inline validation, link columns, social links and a legal line. The bottom band sets a large wordmark over a dot field in the accent colour. The field drifts left over 40 seconds. The wordmark rises into place as the band scrolls in. On fine pointers, a 190px spotlight follows the cursor and dims the dots outside it.

```tsx
import { DitheredFooter } from "@/components/marketing/dithered-footer";

<DitheredFooter
  brand="Acme"
  tagline="Tools for teams who ship."
  accent="var(--chart-1)"
  columns={[{ title: "Product", links: [{ label: "Pricing", href: "/pricing" }] }]}
  onSubscribe={(email) => console.log(email)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `brand` | `string` | `"Acme"` | Shown at the left and as the band wordmark. |
| `tagline` | `string` | placeholder | Shown under the brand. |
| `columns` | `{ title: string; links: { label: string; href: string }[] }[]` | placeholder columns | Right-hand link columns. |
| `socials` | `{ label: string; href: string }[]` | X, GitHub, LinkedIn | Text links, with the label as the accessible name. |
| `legal` | `string` | copyright line | Shown at the right of the social row. |
| `accent` | `string` | `"var(--primary)"` | Any CSS colour. Sets the dot field and the focus outline. |
| `onSubscribe` | `(email: string) => void` | | Called with the trimmed email when it is valid. |

The form validates in place with `noValidate`, so the browser shows no bubbles. Motion is gated by `prefers-reduced-motion: no-preference`. Browsers without scroll-driven animations fall back to an intersection-triggered rise.

Other footer props are passed through, including `className`.

## Origin

Inspired by https://21st.dev/@otatechie/components/dithered-footer; independently written.
