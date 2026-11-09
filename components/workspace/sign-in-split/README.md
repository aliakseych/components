# Sign In: Split

A split sign-in screen. The left column is the sign-in form from [`workspace/auth-05`](../auth-05/README.md), which can also switch to sign-up. The right column is a `FlowPanel`: soft gradient blobs drift slowly behind an optional quote. On screens narrower than `md` the panel stacks under the form, or hides with `hidePanelOnMobile`.

```tsx
import { SignInSplit } from "./index";

<SignInSplit
  form={{
    productName: "Acme Analytics",
    onSignIn: async ({ email, password }) => {
      await signIn(email, password); // return { status: "error", message } to refuse
    },
    forgotPasswordHref: "/forgot-password",
  }}
  texture="waves"
>
  <blockquote>Signing in is quick now.</blockquote>
  <figcaption>Sarah Chen, Operations lead</figcaption>
</SignInSplit>;
```

## Props

### `SignInSplit`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `form` | `Auth5FormProps` | required | Forwarded to the auth-05 form. `productName` is required. Includes `onSignIn`, `onSignUp`, `onProvider`, `providers`, `forgotPasswordHref` and `terms` |
| `texture` | `"waves" \| "grain" \| "mesh"` | `"mesh"` | Panel texture |
| `speed` | `number` | `18` | Seconds per loop |
| `colors` | `string[]` | `var(--chart-1)`, `var(--chart-2)`, `var(--primary)` | 3 to 4 CSS colours |
| `hidePanelOnMobile` | `boolean` | `false` | Hides the panel below `md` |
| `children` | `ReactNode` | none | Quote shown in a card on the panel |

The component renders a `section` and forwards other native props to it.

### `FlowPanel`

Use it alone for any decorative panel. It takes `texture`, `speed`, `colors` and `children`, and forwards other native props to its `div`.

| Texture | Look |
| --- | --- |
| `waves` | Blobs with diagonal stripes sliding across them |
| `grain` | Blobs under a noise overlay (SVG `feTurbulence`) |
| `mesh` | Four larger, overlapping blobs |

## Behaviour

- The animation uses CSS `@keyframes`, one set per panel. With `prefers-reduced-motion: reduce`, the blobs and stripes stop.
- The panel paints only its own background (`bg-muted`). The page behind the component is not touched.
- Colours come from theme tokens or the `colors` prop. The component has no hex values.
- Form ids come from `useId` inside auth-05, so several instances on one page do not clash.
- Pending and success states come from auth-05: `onSignIn` is awaited, the button reads "Signing in…", and the card shows a done state when it resolves without an error.

## Install in an app

Install the form with `npx shadcn@latest add @dashboardblocks/auth-05`, then copy this folder and `components/workspace/auth-05`. This component has no shadcn registry item of its own.

## Origin

The layout started from https://21st.dev/@jahed/components/sign-in. The form is now auth-05, and the flow panel is written for this library.
