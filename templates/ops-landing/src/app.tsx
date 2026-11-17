import { useCallback, useRef, useState } from "react";
import { OpsLanding } from "@/components/marketing/ops-landing";
import { ManifestoDialog } from "@/components/manifesto-dialog";
import { config } from "@/template.config";
import { faq, testimonials } from "@/sample/content";

/** The landing page. `manifesto` opens the manifesto sheet on first render (used by `/?manifesto=1`). */
export function App({ manifesto = false }: { manifesto?: boolean }) {
  const [open, setOpen] = useState(manifesto);
  const pageRef = useRef<HTMLDivElement>(null);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const { brandName, cta, email } = config;

  return (
    <>
      <div ref={pageRef}>
        <OpsLanding
          brandName={brandName}
          header={{ links: [{ label: "Manifesto", onClick: show }], cta }}
          hero={{ cta, className: "pt-[82px] max-[800px]:pt-[76px]" }}
          features={{ heading: <>One assistant for<br />the whole business.</> }}
          integrations={{ title: <>{brandName} works with the apps<br className="max-[800px]:hidden" /> you already use.</> }}
          splitPrimary={{ title: "Your tools. In view.", description: "See every linked app, when it last synced, and anything that needs a closer look." }}
          splitSecondary={{ title: "You stay in charge.", description: "See what it found, check the source, and approve the next step." }}
          testimonials={{ title: `What changes once ${brandName} joins the team.`, items: testimonials }}
          setup={{ title: "Live in under three days." }}
          faq={faq}
          cta={{
            badge: "Trusted by growing teams",
            title: <>See what {brandName} can<br className="max-[800px]:hidden" /> take off your desk.</>,
            actions: [cta, { label: email, href: `mailto:${email}`, variant: "ghost" }],
            footer: {
              brand: brandName,
              tagline: (
                <div className="space-y-1 whitespace-pre-line">
                  {config.tagline.map((line) => <p key={line}>{line}</p>)}
                </div>
              ),
              columns: [
                {
                  heading: brandName,
                  links: [
                    { label: "Manifesto", onClick: show },
                    { label: "Blog", href: "#blog" },
                    { label: config.location },
                    { label: email, href: `mailto:${email}` },
                  ],
                },
                { heading: "Socials", links: config.socials.map((s) => ({ ...s, external: true })) },
                { heading: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
              ],
              legal: config.legal,
            },
          }}
        />
      </div>
      <ManifestoDialog open={open} onClose={hide} manifesto={config.manifesto} brandName={brandName} pageRef={pageRef} />
    </>
  );
}
