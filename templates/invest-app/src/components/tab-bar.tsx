"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Главная", icon: House },
  { href: "/deals", label: "Сделки", icon: LayoutGrid },
  { href: "/account", label: "Счёт", icon: Wallet },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/offline") return null;
  return (
    <nav aria-label="Навигация" className="glass isolate fixed inset-x-4 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 mx-auto flex h-16 max-w-[416px] items-center rounded-full p-1.5">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/" || pathname.startsWith("/pools") || pathname.startsWith("/portfolio")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full flex-1 items-center justify-center rounded-full font-medium",
              active ? "gap-2 text-sm text-primary-foreground" : "flex-col gap-0.5 text-[10px] text-muted-foreground",
            )}
          >
            {active && <motion.span layoutId="tab-pill" aria-hidden className="absolute inset-0 -z-10 rounded-full bg-primary" />}
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
