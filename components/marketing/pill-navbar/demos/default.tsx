import { Blocks, Bot, BookOpen, Building2, ExternalLink, GraduationCap, Home, LayoutGrid, LayoutTemplate, Monitor, Palette, PenTool, Plug, Search, Sparkles, Terminal, Users, Video } from "lucide-react";
import { PillNavbar, type PillNavbarItem } from "../index";

export const brandMenu = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Docs", href: "#docs", icon: BookOpen },
  { label: "Dev portal", href: "#dev", icon: Terminal },
  { label: "Brand kit", href: "#brand", icon: Palette },
  { label: "Open app", href: "#app", icon: ExternalLink },
];

export const tools = [
  { label: "Search", icon: Search, onClick: () => {} },
  { label: "Open board", icon: LayoutGrid, href: "#board" },
];

export const brand = {
  name: "Sketchboard",
  href: "#home",
  paths: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
};

export const actions = [
  { label: "Log in", href: "#login" },
  { label: "Sign up", href: "#signup", primary: true },
];

export const items: PillNavbarItem[] = [
  { label: "Pricing", href: "#pricing" },
  {
    label: "Product",
    columns: [
      {
        heading: "Product",
        links: [
          { label: "Whiteboard", href: "#whiteboard", description: "Brainstorm, diagram and plan", icon: PenTool },
          { label: "AI", href: "#ai", description: "Builds boards from a prompt", icon: Sparkles },
          { label: "Wireframes", href: "#wireframes", description: "Layouts for sites and apps", icon: LayoutTemplate },
          { label: "Desktop app", href: "#desktop", description: "Native app for Mac and Windows", icon: Monitor },
        ],
      },
      {
        heading: "Works with",
        links: [
          { label: "Video calls", href: "#calls", description: "Run a board inside your meeting", icon: Video },
          { label: "Integrations", href: "#integrations", description: "Chat, issues and more", icon: Plug },
          { label: "Agents", href: "#agents", description: "Let your AI tools draw", icon: Bot },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    columns: [
      {
        heading: "Solutions",
        links: [
          { label: "Enterprise", href: "#enterprise", description: "Scale with security and SSO", icon: Building2 },
          { label: "Education", href: "#education", description: "For classrooms and students", icon: GraduationCap },
          { label: "Remote teams", href: "#remote", description: "Collaborate from anywhere", icon: Users },
        ],
      },
    ],
  },
  {
    label: "Resources",
    align: "center",
    columns: [
      {
        heading: "Learn",
        links: [
          { label: "Documentation", href: "#docs", description: "Guides and how-tos", icon: BookOpen },
          { label: "Templates", href: "#templates", description: "Boards ready to open", icon: Blocks },
        ],
      },
    ],
  },
];

export default function Demo() {
  return (
    <div className="h-[120px] w-full bg-muted/40 pt-4">
      <PillNavbar brand={brand} items={items} actions={actions} brandMenu={brandMenu} tools={tools} />
    </div>
  );
}
