# Phone Scroll Hero

Rebuilt from the layout and motion of a day or night sky hero with a pinned phone. Timings and easings follow the reference closely.

The hero shows a day or night sky, a laurel badge, a headline and a CTA. Below them, a phone pins in place while the page scrolls. The chat plays in beat by beat. Then four source cards slide in and connector lines draw toward the phone. Finally, the brief card opens into a reader, and scrolling moves through the reader's body. Scrolling holds at the reader threshold until the card finishes opening, then waits for fresh wheel or touch input. On desktop, Lenis slows the wheel inside the hero (`scrollSpeed`). With reduced motion, everything shows at its final state.

```tsx
import { PhoneScrollHero } from "@/components/hero-page/phone-scroll-hero";

const end = useRef<HTMLDivElement>(null);
<PhoneScrollHero endRef={end} cta={{ label: "Book a call", href: "/book" }} />;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `badge` | `ReactNode` | `"Trusted by working fleets"` | Text between the laurels. |
| `title` | `ReactNode \| (mode) => ReactNode` | site headline | Receives `"day"` or `"night"`. |
| `description` | `ReactNode` | site intro | |
| `cta` | `{ label; href }` | `Book a call` | |
| `sources` | `HeroSource[]` | `defaultSources` | Up to four cards, each with `label`, `title`, `lines` and an optional `icon`. |
| `children` | `ReactNode` | `<ChatScreen />` | The phone screen, drawn at 402×876 px and scaled to fit. |
| `mode` | `"auto" \| "day" \| "night"` | `"auto"` | In `auto`, night runs from 20:00 to 07:59. |
| `sky` | `Record<mode, string[]>` | `defaultSky` | Gradient stops for each mode. |
| `headerOffset` | `number` | `64` | Height of the sticky header. The stage pins below it. |
| `scrollSpeed` | `number` | `0.7` | Wheel speed inside the hero on desktop. |
| `smoothScroll` | `boolean` | `true` | Turns Lenis on or off. |
| `endRef` / `endId` | | | A zero-height marker at the hero's end, used to collapse a header. |

The hero finds its scroll container on its own: the nearest overflow ancestor, otherwise the window. A custom screen can read progress with `useHeroStore()` from `./progress`.

## Theming

The phone UI, the cards and the text use theme tokens. Only the sky stops are raw colors, and you pass them in as data. The hero paints no page background.

## Differences from the site

- The site's title and date fly separately when the card opens. This port uses one morph instead.
- Read Aloud uses `speechSynthesis` instead of recorded audio.
- The laurel and the source art are drawn with SVG and lucide icons instead of webp images.
