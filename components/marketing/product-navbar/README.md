# Product Navbar

Inspired by https://21st.dev/@ln-dev7/components/dorpdown-navigation and https://21st.dev/@designali-in/components/vercel-navbar; independently written.

A top bar with dropdown menus, plain links and right-hand actions. Menus open on click or hover. Arrow Down opens a menu and moves through its links, Escape closes it and returns focus to the trigger. Below `md`, everything sits in a single disclosure panel.

```tsx
import { ProductNavbar } from "@/components/marketing/product-navbar";

<ProductNavbar
  brand="Northwind"
  items={[
    { label: "Products", links: [{ label: "Deploys", href: "#deploys", description: "Ship every branch" }] },
    { label: "Pricing", href: "#pricing" },
  ]}
/>;
```

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `brand` | `ReactNode` | Logo or wordmark |
| `brandHref` | `string` | Defaults to `#` |
| `items` | `ProductNavbarItem[]` | A link with `href`, or a menu with `links` |
| `actions` | `ReactNode` | Right-hand buttons |
| `defaultOpenMenu` | `string` | Menu label to show open on first render |
