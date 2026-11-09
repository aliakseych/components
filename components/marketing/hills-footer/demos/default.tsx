import { HillsFooter } from "../index";

export default function Demo() {
  return (
    <HillsFooter
      className="-m-8 w-[calc(100%+4rem)]"
      headline="Take the first step with Harbor today."
      accent="first step"
      intro="Confidential, patient support is one click away."
      cta={{ label: "Contact support", href: "#" }}
      brand={{ label: "Harbor home", href: "#" }}
      columns={[
        {
          title: "Product",
          links: [
            { label: "Features", href: "#" },
            { label: "Pricing", href: "#" },
            { label: "Changelog", href: "#" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Guides", href: "#" },
            { label: "Status", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
          ],
        },
      ]}
      onSubscribe={() => {}}
    />
  );
}
