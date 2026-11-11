# Beam Grid Hero

Infra/dev-tool hero. A slowly drifting grid (30s loop, radial fade) sits behind the content. Gradient beams fall along grid columns onto the top edge of a framed terminal; each hit bursts into 8–12 particles and flashes the frame border. The terminal types a command, prints check-marked lines, then loops. The headline rises in word by word with a blur.

```tsx
<BeamGridHero
  eyebrow="Now in public beta"
  title="Ship infrastructure at the speed of thought"
  description="..."
  actions={[{ label: "Start building", href: "#start" }]}
  install="npm i -g @acme/cli"
  command="acme deploy"
  output={["Built in 1.8s", "Deployed"]}
/>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `eyebrow` | `ReactNode` | Small pill above the title |
| `title` | `string` | Split into words for the entrance |
| `description` | `ReactNode` | Sub copy |
| `actions` | `{ label, href, variant? }[]` | Rendered as buttons (`default` or `outline`) |
| `command` | `string` | Typed in the terminal |
| `output` | `string[]` | Lines printed after typing, each with a check |
| `install` | `string` | Copyable pill text; omitted when unset |
| `beamCount` | `number` (5) | Concurrent beams; 0 disables |
| `colors` | `{ beam?, beamAlt?, success? }` | CSS colours; defaults `--chart-2/5/4` |
| `className` | `string` | Root class |

Reduced motion: grid stays static, beams are not rendered, the terminal shows its final state and the headline appears immediately.
Beams are aligned to a 48px grid and land only within the frame's width.
