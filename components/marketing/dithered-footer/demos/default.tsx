import { DitheredFooter } from "../index";

export default function Demo() {
  return (
    <DitheredFooter
      className="-m-8 w-[calc(100%+4rem)]"
      brand="Acme"
      tagline="Tools for teams who ship. Built in the open, one release at a time."
      columns={[
        {
          title: "Product",
          links: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Changelog", href: "#changelog" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Docs", href: "#docs" },
            { label: "Guides", href: "#guides" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#about" },
            { label: "Careers", href: "#careers" },
          ],
        },
      ]}
    />
  );
}
