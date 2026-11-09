import { useId, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PrismNavItem = { label: string; href: string };

export type PrismHeroProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  brand?: string;
  navItems?: PrismNavItem[];
  headline?: string;
  body?: string;
  cta?: { label: string; href: string };
  /** Accessible name for the icon button in the navbar. */
  menuLabel?: string;
};

// Keyframes are scoped to this component by name, so no app stylesheet is needed.
const css = `
@keyframes prism-rise {
  from { opacity: 0; transform: translateY(0.6em); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
.prism-word { animation: prism-rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .prism-word { animation: none; }
}
`;

export function PrismHero({
  brand = "Prism",
  navItems = [],
  headline = "Stories that refuse to stay on the page.",
  body = "A studio of filmmakers and storytellers building work with patience, texture and a point of view.",
  cta,
  menuLabel = "Open menu",
  className,
  ...props
}: PrismHeroProps) {
  const words = headline.split(" ");
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section
      className={cn(
        "relative isolate flex min-h-svh flex-col overflow-hidden bg-background text-foreground",
        className,
      )}
      {...props}
    >
      {/* Atmosphere: layered gradients and one blurred shape, all from theme tokens. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 72% 35%, color-mix(in oklch, var(--chart-5) 45%, transparent) 0%, transparent 70%), radial-gradient(50% 45% at 20% 70%, color-mix(in oklch, var(--chart-2) 30%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="absolute left-1/2 top-1/3 size-[60vmin] -translate-x-1/2 rounded-full bg-chart-1/25 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <style>{css}</style>

      <header className="relative z-20 flex justify-center px-4 pt-5">
        <nav
          aria-label="Primary"
          className="flex w-full max-w-3xl items-center gap-1 rounded-full border bg-card/75 p-1.5 pl-5 shadow-sm backdrop-blur-md"
        >
          <span className="mr-auto text-sm font-semibold tracking-tight">{brand}</span>
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {navItems.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full md:hidden"
              aria-label={menuLabel}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          )}
        </nav>
        {menuOpen && (
          <ul
            id={menuId}
            onKeyDown={(event) => {
              if (event.key === "Escape") setMenuOpen(false);
            }}
            className="absolute inset-x-4 top-full mt-2 flex flex-col gap-1 rounded-2xl border bg-card p-2 shadow-lg md:hidden"
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="relative z-10 flex flex-1 items-center px-6 pt-16 md:px-12">
        <h1 className="max-w-5xl text-balance text-[clamp(2.75rem,8.5vw,8rem)] font-semibold leading-[0.95] tracking-tight">
          {words.map((word, index) => (
            <span key={`${word}-${index}`}>
              <span
                className="prism-word inline-block"
                style={{ animationDelay: `${180 + index * 85}ms` }}
              >
                {word}
              </span>
              {index < words.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-start gap-6 px-6 pb-10 md:flex-row md:items-end md:justify-between md:px-12">
        <p className="max-w-sm text-sm text-muted-foreground md:text-base">{body}</p>
        {cta ? (
          <a
            href={cta.href}
            className="group inline-flex items-center gap-3 rounded-full border bg-card/80 py-1.5 pl-5 pr-1.5 text-sm font-medium shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cta.label}
            <span className="grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
