# Product Rail Gallery

Inspired by https://21st.dev/@dhxwhy/components/product-rail-gallery; independently written.

A shop section with a full-width chrome rail. Each garment hangs from a hook and hanger, drawn as an inline SVG (tee, hoodie, coat or dress) or taken from real images. Garments rest in profile, sway gently, and turn to face the viewer when selected. Moving the pointer across a garment tilts it briefly toward the direction of motion. Clicking the selected garment opens a detail overlay with front and back faces.

```tsx
import { ProductRail } from "@/components/marketing/product-rail";

<ProductRail
  eyebrow="New season · eight pieces on the rail"
  headline="Pick a piece off the rail."
  items={[
    { id: "linen-tee", name: "Linen tee", price: "$48", kind: "tee", color: "#e9e2d0", description: "Heavy linen, cut boxy." },
  ]}
  colors={{ rail: "#8a9099", tag: "white", shadow: "#1b1f24" }}
  onOpen={(item) => router.push(`/shop/${item.id}`)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `eyebrow` | `string` | required | Small letter-spaced caps above the headline. |
| `headline` | `string` | required | Section heading. |
| `items` | `RailItem[]` | required | One garment per entry. The rail lays them out in order. |
| `colors` | `{ rail?, tag?, shadow? }` | theme tokens | Any CSS colour, set as custom properties on the section. |
| `onSelect` | `(item, index) => void` | | Called when a garment is clicked to make it active. |
| `onOpen` | `(item, index) => void` | | Called when the active garment is clicked. Without it, an inline detail overlay opens. |
| `onShop` | `(item, index) => void` | | Called by the "Shop the edit" button under the rail. |

`RailItem` is `{ id, name, price, kind: "tee" | "hoodie" | "coat" | "dress", color, description, images?: { front?, side? } }`. `color` is any CSS colour and is the only garment colour. When `images` is set, those photos replace the drawn art; `side` falls back to the drawn profile.

Other section props are passed through, including `className`.

## Behaviour

- The row centres on the active garment, and its neighbours spread apart. Selecting a garment takes 500ms.
- The selected garment turns from profile to front in 600ms. Pointer velocity adds a tilt capped at 18°, which eases back to zero.
- The component paints only its own section. Colours come from theme tokens or the `colors` prop.
- `prefers-reduced-motion` stops the sway and the tag swing, makes flips instant and disables pointer tilt.

## Caveats

- Garment art is drawn, so it suits a concept or placeholder shop; use real photos through `images` for production.
- Only one garment is shown in front at a time. The rail is not a comparison view.

## Origin

Inspired by https://21st.dev/@dhxwhy/components/product-rail-gallery; independently written.
