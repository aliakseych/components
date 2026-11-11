import { Mail, Rss, Globe } from "lucide-react";
import { RevealFooterPage } from "../index";

const sections = [
  ["Ship without the ceremony", "Deploy previews, rollbacks and release notes from one calm workspace."],
  ["Every change, accounted for", "Audit trails and review queues that follow the work instead of slowing it."],
  ["Built to be left alone", "Quiet defaults, loud alarms only when something is really wrong."],
];

export default function Demo() {
  return (
    <RevealFooterPage
      className="-m-8 w-[calc(100%+4rem)]"
      footer={{
        wordmark: "Northwind",
        heading: "Ready when you are.",
        cta: { label: "Start for free", href: "#start" },
        columns: [
          { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Changelog", href: "#changelog" }] },
          { title: "Resources", links: [{ label: "Docs", href: "#docs" }, { label: "Guides", href: "#guides" }, { label: "API", href: "#api" }] },
          { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#careers" }, { label: "Contact", href: "#contact" }] },
        ],
        socials: [
          { label: "Email", href: "#gh", icon: Mail },
          { label: "RSS", href: "#tw", icon: Rss },
          { label: "Website", href: "#li", icon: Globe },
        ],
        status: { label: "All systems operational" },
        legal: "© 2026 Northwind Labs, Inc.",
      }}
    >
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        {sections.map(([title, body]) => (
          <section key={title} className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="text-muted-foreground">{body}</p>
          </section>
        ))}
      </main>
    </RevealFooterPage>
  );
}
