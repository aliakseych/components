# Waitlist: Split

Inspired by https://21st.dev/@shadcnspace/components/waitlist-01; independently written.

A split landing section. The left column holds an announcement badge, headline, supporting text, an email field with a request button, overlapping member avatars with a count and a "stay in the loop" link row. The right column is a gradient panel with a mock form card. On phones the panel sits below the text.

```tsx
import { WaitlistSplit } from "./index";

<WaitlistSplit
  badge="Spring cohort open"
  headline="Early access for product teams."
  joinedCount={4210}
  onSubmit={(email) => joinWaitlist(email)}
/>;
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `badge` | `string` | `"Now in private beta"` | Badge text with a dot |
| `headline` | `string` | Placeholder headline | Main heading |
| `body` | `string` | Placeholder paragraph | Supporting text |
| `joinedCount` | `number` | `1280` | Formatted with `en-US` separators |
| `members` | `string[]` | `["AN", "BK", "CM", "DO"]` | Initials shown in the avatar row |
| `links` | `{ label, href }[]` | Changelog, Roadmap, Blog | Stay-in-the-loop links |
| `submitLabel` | `string` | `"Request access"` | Submit button text |
| `onSubmit` | `(email: string) => void \| Promise<void>` | none | Called with the entered email. A promise keeps the button pending until it settles. On success the form shows a confirmation; on rejection it shows an error |
| `colors` | `WaitlistSplitColors` | theme tokens | Colour roles, see Theming |

An invalid email shows an inline message under the field, not a browser bubble.

## Theming

`colors` sets the colour roles, each a CSS colour: `accent` (badge dot and request buttons), `panelStart`, `panelMid` and `panelEnd` (the gradient panel) and `glow` (the corner light on that panel). Defaults are `var(--primary)`, `var(--chart-2)`, `var(--chart-4)`, `var(--chart-1)` and `var(--chart-5)`. The card surface stays on `bg-card`.

The component renders a `section` and forwards other native props to it.

## Install in an app

Copy the folder into the app, or use the shadcn parts listed in `meta.json`.

## Origin

Inspired by https://21st.dev/@shadcnspace/components/waitlist-01; independently written.
