import { BarChart3, BookOpen, Boxes, Building2, Layers, LifeBuoy, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductNavbar, type ProductNavbarItem } from "../index";

const items: ProductNavbarItem[] = [
  {
    label: "Products",
    links: [
      { label: "Deploys", href: "#deploys", description: "Ship every branch to a preview", icon: Rocket },
      { label: "Analytics", href: "#analytics", description: "See what people really use", icon: BarChart3 },
      { label: "Storage", href: "#storage", description: "Files and databases in one place", icon: Boxes },
      { label: "Security", href: "#security", description: "Audit logs and access rules", icon: ShieldCheck },
    ],
  },
  {
    label: "Solutions",
    links: [
      { label: "Startups", href: "#startups", description: "Credits for your first year", icon: Layers },
      { label: "Enterprise", href: "#enterprise", description: "SSO, SLAs and a named contact", icon: Building2 },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Guides", href: "#guides", description: "Step by step, from zero", icon: BookOpen },
      { label: "Support", href: "#support", description: "Talk to a person", icon: LifeBuoy },
    ],
  },
  { label: "Docs", href: "#docs" },
  { label: "Pricing", href: "#pricing" },
];

export default function Demo() {
  return (
    <div className="-m-8 h-[28rem] w-[calc(100%+4rem)]">
      <ProductNavbar
        brand={
          <>
            <Layers className="size-5" aria-hidden="true" />
            Northwind
          </>
        }
        items={items} defaultOpenMenu="Products"
        actions={
          <>
            <Button variant="outline" size="sm">Contact</Button>
            <Button size="sm">Dashboard</Button>
          </>
        }
      />
    </div>
  );
}
