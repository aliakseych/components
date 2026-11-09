import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DitheredLink = { label: string; href: string };
export type DitheredColumn = { title: string; links: DitheredLink[] };

export type DitheredFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children"> & {
  /** Large wordmark in the bottom band, and the name shown at the left. */
  brand?: string;
  tagline?: string;
  columns?: DitheredColumn[];
  socials?: DitheredLink[];
  legal?: string;
  /** Colour of the dot field and the focus outline. Any CSS colour. */
  accent?: string;
  onSubscribe?: (email: string) => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRIFT_PX = 360;
const SPOT_RADIUS = 190;

const DEFAULT_COLUMNS: DitheredColumn[] = [
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
      { label: "Community", href: "#community" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press", href: "#press" },
    ],
  },
];

const DEFAULT_SOCIALS: DitheredLink[] = [
  { label: "X", href: "#x" },
  { label: "GitHub", href: "#github" },
  { label: "LinkedIn", href: "#linkedin" },
];

const LINK_CLASS =
  "rounded-sm text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(.4,0,.2,1)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--band-accent)] focus-visible:outline-none";

// Keyframes and scroll-driven rules live here because Tailwind has no utility for them.
const STYLE = `
@media (prefers-reduced-motion: no-preference) {
  .dithered-field { animation: dithered-drift 40s linear infinite; }
  @supports (animation-timeline: view()) {
    .dithered-word {
      animation: dithered-rise linear both;
      animation-timeline: view();
      animation-range: entry 20% entry 100%;
    }
  }
  @supports not (animation-timeline: view()) {
    .dithered-word { transform: translateY(30%); transition: transform 900ms cubic-bezier(.2,.7,.1,1); }
    .dithered-word.is-in { transform: translateY(0); }
  }
}
@keyframes dithered-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-${DRIFT_PX}px); }
}
@keyframes dithered-rise {
  from { transform: translateY(30%); }
  to { transform: translateY(0); }
}
`;

export function DitheredFooter({
  brand = "Acme",
  tagline = "Tools for teams who ship. Built in the open, one release at a time.",
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  legal = "© 2026 Acme, Inc. All rights reserved.",
  accent = "var(--primary)",
  onSubscribe,
  className,
  style,
  ...props
}: DitheredFooterProps) {
  const formId = useId();
  const errorId = `${formId}-error`;
  const bandRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  // Spotlight: follows the pointer on fine-pointer devices, one update per frame.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const finePointer = window.matchMedia("(pointer: fine)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!finePointer.matches || !motionOk.matches) return;

    let frame = 0;
    let point: { x: number; y: number } | null = null;
    const apply = () => {
      frame = 0;
      if (point) {
        band.style.setProperty("--mx", `${point.x}px`);
        band.style.setProperty("--my", `${point.y}px`);
        band.style.setProperty("--out", "0.22");
      } else {
        band.style.setProperty("--out", "1");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      const rect = band.getBoundingClientRect();
      point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      schedule();
    };
    const onLeave = () => {
      point = null;
      schedule();
    };
    band.addEventListener("pointermove", onMove);
    band.addEventListener("pointerleave", onLeave);
    return () => {
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      band.style.removeProperty("--mx");
      band.style.removeProperty("--my");
      band.style.removeProperty("--out");
    };
  }, []);

  // Browsers without scroll-driven timelines get the wordmark rise from a class instead.
  useEffect(() => {
    const word = wordRef.current;
    if (!word || (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()"))) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          word.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(word);
    return () => io.disconnect();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setSubscribed(false);
      setError("Enter an email address, such as you@example.com.");
      return;
    }
    setError(null);
    setSubscribed(true);
    onSubscribe?.(value);
  };

  return (
    <footer
      className={cn("relative overflow-clip border-t bg-background text-foreground", className)}
      style={{ ...style, "--band-accent": accent } as CSSProperties}
      {...props}
    >
      <style>{STYLE}</style>

      <div className="px-6 pt-12 md:px-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-20">
          <div className="max-w-sm space-y-5">
            <p className="text-lg font-semibold tracking-tight">{brand}</p>
            <p className="text-sm text-muted-foreground">{tagline}</p>
            <form onSubmit={handleSubmit} noValidate className="space-y-2">
              <label htmlFor={`${formId}-email`} className="text-sm font-medium">
                Get product updates by email
              </label>
              <div className="flex gap-2">
                <Input
                  id={`${formId}-email`}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(null);
                  }}
                />
                <Button type="submit">Subscribe</Button>
              </div>
              <p id={errorId} aria-live="polite" className="min-h-5 text-sm">
                {error ? <span className="text-destructive">{error}</span> : subscribed ? "Thanks, you are on the list." : null}
              </p>
            </form>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-14">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className={cn("text-sm", LINK_CLASS)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Social" className="flex gap-6">
            {socials.map((link) => (
              <a key={link.label} href={link.href} className={LINK_CLASS}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-muted-foreground">{legal}</p>
        </div>
      </div>

      <div
        ref={bandRef}
        className="relative mt-12 h-[clamp(160px,26vw,260px)] border-t"
      >
        <div
          className="absolute inset-0"
          style={{
            maskImage: `radial-gradient(circle ${SPOT_RADIUS}px at var(--mx, 50%) var(--my, 50%), #000 35%, rgb(0 0 0 / var(--out, 1)) 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${SPOT_RADIUS}px at var(--mx, 50%) var(--my, 50%), #000 35%, rgb(0 0 0 / var(--out, 1)) 100%)`,
          }}
        >
          <div
            className="dithered-field absolute inset-y-0 left-0 bg-[var(--band-accent)]"
            style={{
              width: `calc(100% + ${DRIFT_PX}px)`,
              maskImage: "radial-gradient(circle, #000 0.9px, transparent 1.3px)",
              WebkitMaskImage: "radial-gradient(circle, #000 0.9px, transparent 1.3px)",
              maskSize: "8px 8px",
              WebkitMaskSize: "8px 8px",
            }}
          />
        </div>
        <div className="relative flex h-full items-end justify-center overflow-clip">
          <p
            ref={wordRef}
            aria-hidden="true"
            className="dithered-word select-none pb-[0.04em] text-[clamp(64px,17vw,220px)] leading-[0.8] font-extrabold tracking-tight text-foreground uppercase"
          >
            {brand}
          </p>
        </div>
      </div>
    </footer>
  );
}
