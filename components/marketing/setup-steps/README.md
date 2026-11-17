# Setup Steps

Centered heading and description over three square gradient cards (3 columns at 801px and up, one 456px-max column below). Card art is built in CSS: a 3 x 3 keycap grid, a stack of toggle rows (real `role="switch"` buttons), and a brief card. All sizing uses container units so the art scales with the card.

```tsx
<SetupSteps
  title="Up and running within a week."
  tools={[{ label: "Accounting", icon: Wallet }]}
  checks={[{ label: "Overdue items" }, { label: "Stalled workflows", defaultOn: false }]}
  brief={{ eyebrow: "Morning brief", title: "3 things need you", items: [{ title: "…", detail: "…", tone: "warn" }] }}
  steps={[{ title: "…", description: "…" }, { title: "…", description: "…" }, { title: "…", description: "…" }]}
/>
```

- Entrance (once, at 35% from the viewport bottom): heading 0ms, description 80ms; per card the art takes 1000ms (32px rise, 0.96 scale), title 80ms, text 160ms; text 800ms, rise 18px. Eased `cubic-bezier(.25,.1,.25,1)`. Disabled under reduced motion.
- `tools` shows at most 9 keycaps. Switch rows toggle on click or Space/Enter.
