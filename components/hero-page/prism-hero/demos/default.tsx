import { PrismHero } from "../index";

export default function Demo() {
  return (
    <PrismHero
      className="-m-8 w-[calc(100%+4rem)]"
      brand="Prism"
      navItems={[
        { label: "Our story", href: "#story" },
        { label: "Collective", href: "#collective" },
        { label: "Workshops", href: "#workshops" },
        { label: "Inquiries", href: "#inquiries" },
      ]}
      headline="Stories that refuse to stay on the page."
      body="A studio of filmmakers and storytellers building work with patience, texture and a point of view."
      cta={{ label: "Join the lab", href: "#join" }}
    />
  );
}
