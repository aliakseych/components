import { BarChart3Icon, BookOpenIcon, LifeBuoyIcon, WalletIcon, type LucideIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../index";

function PanelLink({ href, icon: Icon, title, text }: { href: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <li>
      <NavigationMenuLink href={href} className="flex-row items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card">
          <Icon aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{text}</span>
        </span>
      </NavigationMenuLink>
    </li>
  );
}

export function SiteNav({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue} className="rounded-xl border bg-card p-1 shadow-xs">
      <NavigationMenuList>
        <NavigationMenuItem value="product">
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-[17rem] flex-col gap-1">
              <PanelLink href="#analytics" icon={BarChart3Icon} title="Analytics" text="Revenue and usage in one place" />
              <PanelLink href="#billing" icon={WalletIcon} title="Billing" text="Plans, invoices and payments" />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-[17rem] flex-col gap-1">
              <PanelLink href="#guides" icon={BookOpenIcon} title="Guides" text="Set up your first report" />
              <PanelLink href="#support" icon={LifeBuoyIcon} title="Support" text="Talk to the team" />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function Demo() {
  return <SiteNav />;
}
