import { Camera, Share2, Users } from "lucide-react";
import { NightCta } from "../index";

export default function Demo() {
  return (
    <NightCta
      badge="Trusted by growing teams"
      title={
        <>
          Discover what Relay can
          <br className="max-[800px]:hidden" /> lift off your desk.
        </>
      }
      actions={[
        { label: "Book a call", href: "#book" },
        { label: "hello@example.com", href: "mailto:hello@example.com", variant: "ghost" },
      ]}
      footer={{
        brand: "Relay",
        tagline: (
          <>
            <p className="text-[#8c8c8c]">verb. To pass along, from old French:</p>
            <ol className="mt-2 flex flex-col gap-1">
              <li>1. to hand a task onward</li>
              <li>2. a steady helper that keeps follow-ups moving while you focus elsewhere.</li>
            </ol>
          </>
        ),
        columns: [
          { heading: "Relay", links: [{ label: "Manifesto", onClick: () => {} }, { label: "Blog", href: "#blog" }, { label: "Springfield, Ohio" }, { label: "hello@example.com", href: "mailto:hello@example.com" }] },
          {
            heading: "Socials",
            links: [
              { label: "Share", href: "#x", icon: <Share2 size={18} />, external: true },
              { label: "Photos", href: "#ig", icon: <Camera size={18} />, external: true },
              { label: "Network", href: "#in", icon: <Users size={18} />, external: true },
            ],
          },
          { heading: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
        ],
        legal: "© 2026 Example Corporation",
      }}
    />
  );
}
