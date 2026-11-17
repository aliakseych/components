// Everything product-specific lives here and in src/sample/. Swap for your own.
import type { ComponentProps } from "react";
import type { OpsLanding } from "@/components/marketing/ops-landing";
import { manifesto } from "@/sample/manifesto";

export const config = {
  /** Wordmark text used in the header, pill, copy and footer. */
  brandName: "Relay",
  /** Primary call to action, used in the header, hero, split sections and closing card. */
  cta: { label: "Book a call", href: "#book" },
  email: "hello@example.com",
  location: "Springfield, USA",
  legal: "© 2026 Example Corporation",
  socials: [
    { label: "Twitter", href: "https://example.com/twitter" },
    { label: "Instagram", href: "https://example.com/instagram" },
    { label: "Linkedin", href: "https://example.com/linkedin" },
  ],
  /** Short dictionary-style lines under the footer wordmark. */
  tagline: ["noun. Relay, in plain English:", "1. a hand-off", "2. the runner who carries\nthe news ahead,\nbefore anyone asks."],
  manifesto,
};

export type LandingOverrides = Omit<ComponentProps<typeof OpsLanding>, "brandName" | "className">;
