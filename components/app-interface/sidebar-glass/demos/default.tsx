import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  MenuIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { GlassSidebar, GlassSidebarProvider, SidebarBrand, UserMenu } from "../index";

const nav = [
  {
    items: [
      { title: "Home", url: "/", icon: HomeIcon, match: "exact" as const },
      { title: "Timetable", url: "/timetable", icon: CalendarIcon },
      { title: "Messages", url: "/messages", icon: MessageSquareIcon, badge: 3 },
    ],
  },
  {
    label: "Learning",
    items: [
      {
        title: "Courses",
        url: "/courses",
        icon: BookOpenIcon,
        items: [
          { title: "Current", url: "/courses/current" },
          { title: "Archive", url: "/courses/archive" },
        ],
      },
      { title: "Settings", url: "/settings", icon: SettingsIcon },
    ],
  },
];

const logo = (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <rect fill="var(--chart-2)" height="24" width="24" />
    <path d="M7 7v6a5 5 0 0 0 10 0V7" fill="none" stroke="var(--background)" strokeWidth="2.5" />
  </svg>
);

const stay = (event: React.MouseEvent) => event.preventDefault();

// On phones the sidebar is a closed sheet, so the page has to offer a way to open it.
function MobileTrigger() {
  const { isMobile, toggleSidebar } = useSidebar();
  if (!isMobile) return null;

  return (
    <div className="flex flex-1 items-center justify-center">
      <button
        className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-medium shadow-xs"
        onClick={toggleSidebar}
        type="button"
      >
        <MenuIcon aria-hidden="true" className="size-4" />
        Open menu
      </button>
    </div>
  );
}

export default function Demo() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("system");

  return (
    // The transform keeps the sidebar's fixed position inside this preview.
    <div className="relative h-[32rem] w-full overflow-hidden rounded-xl border bg-muted [transform:translateZ(0)]">
      <GlassSidebarProvider className="min-h-full">
        <GlassSidebar
          brand={<SidebarBrand logo={logo} name="Campus" />}
          className="h-full!"
          footer={
            <UserMenu
              choices={[
                {
                  label: "Language",
                  value: language,
                  onChange: setLanguage,
                  options: [
                    { value: "en", label: "English" },
                    { value: "ru", label: "Русский" },
                  ],
                },
                {
                  label: "Theme",
                  value: theme,
                  onChange: setTheme,
                  options: [
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" },
                  ],
                },
              ]}
              items={[{ key: "profile", title: "Profile", icon: UserIcon, href: "/profile" }]}
              name="Sam Lee"
              onLogout={() => {}}
              platforms={[
                { key: "lms", name: "Campus LMS", description: "Courses and grades", href: "#", current: true },
                { key: "library", name: "Library", description: "Books and media", href: "#" },
              ]}
              renderLink={(props) => <a {...props} onClick={stay} />}
              subtitle="sam.lee"
              variant="row"
            />
          }
          nav={nav}
          pathname="/courses/current"
          renderLink={(props) => <a {...props} onClick={stay} />}
        />
        <MobileTrigger />
      </GlassSidebarProvider>
    </div>
  );
}
