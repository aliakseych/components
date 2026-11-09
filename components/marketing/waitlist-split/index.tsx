import { useId, useState, type ComponentPropsWithoutRef, type CSSProperties, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type WaitlistLink = {
  label: string;
  href: string;
};

/** Colour roles. Each is any CSS colour and defaults to a theme token. */
export type WaitlistSplitColors = {
  /** Badge dot, request buttons. Default `var(--primary)`. */
  accent?: string;
  /** Gradient panel, start corner. Default `var(--chart-2)`. */
  panelStart?: string;
  /** Gradient panel, middle. Default `var(--chart-4)`. */
  panelMid?: string;
  /** Gradient panel, end corner. Default `var(--chart-1)`. */
  panelEnd?: string;
  /** Glow in the top corner of the gradient panel. Default `var(--chart-5)`. */
  glow?: string;
};

export type WaitlistSplitProps = Omit<ComponentPropsWithoutRef<"section">, "onSubmit"> & {
  badge?: string;
  headline?: string;
  body?: string;
  /** Total people who have already joined. Shown with thousands separators. */
  joinedCount?: number;
  /** Initials for the overlapping avatar row, shown in order. */
  members?: string[];
  links?: WaitlistLink[];
  submitLabel?: string;
  /** May return a promise. The button shows a pending state until it settles. */
  onSubmit?: (email: string) => void | Promise<void>;
  colors?: WaitlistSplitColors;
};

const defaultLinks: WaitlistLink[] = [
  { label: "Changelog", href: "#changelog" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Blog", href: "#blog" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numberFormat = new Intl.NumberFormat("en-US");

function themeStyle(colors: WaitlistSplitColors | undefined): CSSProperties {
  return {
    "--waitlist-split-accent": colors?.accent ?? "var(--primary)",
    "--waitlist-split-panel-start": colors?.panelStart ?? "var(--chart-2)",
    "--waitlist-split-panel-mid": colors?.panelMid ?? "var(--chart-4)",
    "--waitlist-split-panel-end": colors?.panelEnd ?? "var(--chart-1)",
    "--waitlist-split-glow": colors?.glow ?? "var(--chart-5)",
  } as CSSProperties;
}

export function WaitlistSplit({
  badge = "Now in private beta",
  headline = "The workspace your team will actually open every morning.",
  body = "Join the waitlist and we will send your invite in the order people signed up. Early members keep their discount for a year.",
  joinedCount = 1280,
  members = ["AN", "BK", "CM", "DO"],
  links = defaultLinks,
  submitLabel = "Request access",
  onSubmit,
  colors,
  className,
  style,
  ...props
}: WaitlistSplitProps) {
  const uid = useId();
  const emailId = `${uid}-email`;
  const errorId = `${uid}-email-error`;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const value = email.trim();
    if (!emailPattern.test(value)) {
      setError("Enter an email like you@company.com.");
      document.getElementById(emailId)?.focus();
      return;
    }

    setError(undefined);
    setPending(true);
    try {
      await onSubmit?.(value);
      setSubmitted(true);
    } catch {
      setError("We could not save your request. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className={cn(
        "grid w-full gap-8 overflow-hidden rounded-xl border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-2 lg:items-center",
        className,
      )}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-(--waitlist-split-accent)" aria-hidden="true" />
          {badge}
        </span>

        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{headline}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{body}</p>

        {submitted ? (
          <p role="status" className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            Thanks. We will email you when your invite is ready.
          </p>
        ) : (
          <form className="flex flex-col gap-2" noValidate onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={emailId} className="sr-only">
                Work email
              </label>
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="h-10 pl-9"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError(undefined);
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  disabled={pending}
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-10 bg-(--waitlist-split-accent) text-primary-foreground hover:bg-(--waitlist-split-accent) hover:opacity-90"
                disabled={pending}
                aria-busy={pending || undefined}
              >
                {pending ? (
                  <>
                    <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  <>
                    {submitLabel}
                    <ArrowRight aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-1" aria-hidden="true">
            {members.map((initials, index) => (
              <Avatar key={`${initials}-${index}`} className="size-9 ring-2 ring-card">
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{numberFormat.format(joinedCount)}</span> people have
            already joined
          </p>
        </div>

        <nav aria-label="Product updates" className="border-t pt-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>Stay in the loop:</span>
            {links.map((link, index) => (
              <span key={link.href} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                <a
                  href={link.href}
                  className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </nav>
      </div>

      <div className="relative min-h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-(--waitlist-split-panel-start) via-(--waitlist-split-panel-mid) to-(--waitlist-split-panel-end)">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,var(--waitlist-split-glow),transparent_50%)] opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-10 h-40 rounded-full bg-background/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-6 flex flex-col gap-4 rounded-xl border bg-card/95 p-5 shadow-xl sm:inset-x-10"
        >
          <span className="text-sm font-semibold">Get early access</span>
          <span className="flex h-9 items-center rounded-md border bg-background px-3 text-sm text-muted-foreground">
            you@company.com
          </span>
          <span className="flex h-9 items-center justify-center rounded-md bg-(--waitlist-split-accent) text-sm font-medium text-primary-foreground">
            Request access
          </span>
        </div>
      </div>
    </section>
  );
}
