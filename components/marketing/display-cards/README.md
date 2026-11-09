# Display Cards: Stack

Inspired by https://21st.dev/@Codehagen/components/display-cards; independently written.

Three cards share one grid cell and fan out down and to the right, with the last card in front. Each card has 3D depth and a layered shadow. Hover or keyboard focus lifts a card forward. The back cards are faded and greyed until they are reached.

```tsx
import { DisplayCards } from "./index";

<DisplayCards
  cards={[
    { title: "Usage alert", description: "Storage passed 80 percent.", date: "Yesterday" },
    { title: "Review requested", description: "Priya asked for a second look.", date: "2 hours ago" },
    { title: "New release", description: "Dark mode is live.", date: "Today" },
  ]}
  colors={{ accent: "var(--chart-2)" }}
/>;
```

Wrap it in a backdrop if you want the dot grid from the demo: `DotGridBackdrop` is exported for that. The stack paints no page background of its own.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `cards` | `DisplayCardItem[]` | required | One to three items: `{ icon?, title, description, date }`. The last item is the front card |
| `colors` | `{ accent?, surface?, shadow? }` | theme tokens | Set as CSS custom properties. `accent` fills the icon chip and the front title, `surface` is the card fill at 70% opacity, `shadow` is the shadow colour |
| `className` | `string` | | Forwarded to the root `div` along with other native props |

Geometry: cards are 22rem by 9rem on desktop. Each step back is 48px right and 40px up, and each card sits 24px deeper in Z. On narrow screens the card width shrinks so the whole stack fits.

Motion: hover and focus-visible lift the card by 40px and 40px in Z, with a 0.7s transition. Under `prefers-reduced-motion` the lift is removed and transitions are off.

## Install in an app

Copy the folder into the app. It needs `lucide-react` for the default icon and uses no shadcn parts.

## Origin

Inspired by https://21st.dev/@Codehagen/components/display-cards; independently written.
