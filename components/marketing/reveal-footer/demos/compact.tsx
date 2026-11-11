import { Mail, Rss } from "lucide-react";
import { RevealFooterPage } from "../index";

export default function Demo() {
  return (
    <RevealFooterPage
      className="-m-8 w-[calc(100%+4rem)]"
      footer={{
        compact: true,
        wordmark: "Northwind",
        columns: [
          { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
          { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
        ],
        socials: [
          { label: "Email", href: "#gh", icon: Mail },
          { label: "RSS", href: "#tw", icon: Rss },
        ],
        status: { label: "Degraded: search delayed", live: false },
        legal: "© 2026 Northwind Labs, Inc.",
      }}
    >
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Release notes</h1>
        <p className="mt-3 text-muted-foreground">The footer sits beneath this page and is uncovered as it scrolls away.</p>
      </main>
    </RevealFooterPage>
  );
}
