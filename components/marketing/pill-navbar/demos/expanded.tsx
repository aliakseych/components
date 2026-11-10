import { Blocks, Bot, BookOpen, Building2, GraduationCap, LayoutTemplate, Monitor, PenTool, Plug, Sparkles, Users, Video } from "lucide-react";
import { PillNavbar, type PillNavbarItem } from "../index";

const brand = {
  name: "Sketchboard",
  href: "#home",
  paths: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
};

const actions = [
  { label: "Log in", href: "#login" },
  { label: "Sign up", href: "#signup", primary: true },
];

const items: PillNavbarItem[] = [
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
    <div className="h-[700px] w-full bg-muted/40 pt-4">
      <PillNavbar brand={brand} items={items} actions={actions} compactAt={4000} defaultExpanded defaultOpen="Product" />
    </div>
  );
}
