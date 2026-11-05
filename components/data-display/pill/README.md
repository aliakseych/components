# Pill

Rounded labels with optional avatars, status dots, change indicators, icons and buttons.

```tsx
import { Pill, PillIndicator } from "./pill";

<Pill>
  <PillIndicator pulse variant="success" />
  Live
</Pill>;
```

## Exports

`Pill`, `PillAvatar`, `PillAvatarGroup`, `PillButton`, `PillDelta`, `PillIcon`, `PillIndicator`, `PillStatus`

## Build a horizontal list of pills

Use a scrolling row rather than wrapping when the pills should stay on one line, such as filters on a phone. See `demos/horizontal-list.tsx` for the full example.

```tsx
<ul
  aria-label="Filter by team"
  className="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  tabIndex={0}
>
  {filters.map((filter) => (
    <li className="shrink-0 snap-start" key={filter}>
      <Pill>{filter}</Pill>
    </li>
  ))}
</ul>
```

Each part of this matters:

1. **Keep one line:** `flex` with `overflow-x-auto` on the list, and `shrink-0` on each item so pills don't get squeezed.
2. **Go edge to edge:** the negative margin, matching width and padding let pills scroll to the screen edge while starting in line with the page. Change `4` and `2rem` to match your page's padding.
3. **Stop cleanly:** `snap-x snap-mandatory` with `snap-start` stops on a pill's edge, and `scroll-px-4` keeps that stop in line with the padding.
4. **Leave room:** `py-1` stops focus rings and pill shadows from being clipped.
5. **Stay accessible:** use a list with an `aria-label`. `tabIndex={0}` lets keyboard users scroll it.

If the row should wrap instead, use `flex flex-wrap gap-2` and remove the rest. If a pill is clickable or selectable, put a real `button` inside the `li` and use `aria-pressed` for the selected state.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT).
