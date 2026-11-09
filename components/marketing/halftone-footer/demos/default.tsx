import { HalftoneFooter } from "../index";

export default function Demo() {
  return (
    <HalftoneFooter
      className="-m-8 w-[calc(100%+4rem)]"
      word="NORTHWIND"
      studio="Northwind Studio, Oslo and Lisbon"
      columns={[
        {
          title: "Index",
          links: [
            { label: "Work", href: "#work" },
            { label: "Archive", href: "#archive" },
            { label: "Journal", href: "#journal" },
          ],
        },
        {
          title: "Studio",
          links: [
            { label: "About", href: "#about" },
            { label: "Process", href: "#process" },
            { label: "Careers", href: "#careers" },
          ],
        },
        {
          title: "Contact",
          links: [
            { label: "Email", href: "mailto:hello@northwind.example" },
            { label: "Press", href: "#press" },
          ],
        },
      ]}
    />
  );
}
