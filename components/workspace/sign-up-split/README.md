# Sign Up: Split

Inspired by https://21st.dev/@diarmuradi/components/sign-up-1; independently written.

A two-column sign-up. The form sits on the left with provider buttons, name, work email, a password with a show and hide toggle and a strength meter, a terms checkbox and the submit button. The right column lists highlights and a testimonial. On phones the columns stack.

```tsx
import { SignUpSplit } from "./index";

<SignUpSplit
  brandName="Acme"
  onSubmit={({ name, email, password }) => createAccount({ name, email, password })}
  signInHref="/sign-in"
/>;
```

The strength meter is measured from the password: length (8 and 12 characters) and how many character classes it mixes. The bar width comes from that score, not from separate data.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `"Create your account"` | Heading |
| `subtitle` | `string` | Free workspace line | Under the heading |
| `brandName` | `string` | `"Northwind"` | Shown beside the mark |
| `brand` | `ReactNode` | Layers icon in a square | Replaces the default mark |
| `providers` | `SignUpProvider[]` | Passkey, SSO, email link | `{ id, label, icon?, onSelect? }`. Shows three per row |
| `highlights` | `string[]` | Three placeholder points | Right column list |
| `testimonial` | `SignUpTestimonial` | One placeholder quote | `{ quote, name, role? }`. Pass `undefined` to hide |
| `onSubmit` | `(values) => void \| Promise<void>` | none | Receives `{ name, email, password, acceptedTerms }`. A promise shows a pending state; a rejection shows an error and keeps the form |
| `signInHref` | `string` | `"#sign-in"` | Footer link |
| `termsHref` / `privacyHref` | `string` | `"#terms"` / `"#privacy"` | Links in the terms line |
| `colors` | `SignUpSplitColors` | theme tokens | Colour roles, see Theming |

Validation runs on submit with inline messages under each field, so the browser's own bubbles never appear. A successful submit replaces the form with a confirmation.

## Theming

`colors` sets the colour roles, each a CSS colour: `accent` (brand mark, links, submit button), `surface` (card), `panel` (side panel tint), `highlight` (check marks and first wash), and `glow` (second wash). Defaults are `var(--primary)`, `var(--card)`, `var(--muted)`, `var(--chart-2)` and `var(--chart-5)`. The component paints no page background; the demo wrapper does.

The component renders a `section` and forwards other native props to it.

## Install in an app

Copy the folder into the app, or use the shadcn parts listed in `meta.json`.

## Origin

Inspired by https://21st.dev/@diarmuradi/components/sign-up-1; independently written.
