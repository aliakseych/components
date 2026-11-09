import {
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { Check, Eye, EyeOff, Fingerprint, KeyRound, Layers, LoaderCircle, Mail, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SignUpProvider = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
};

export type SignUpTestimonial = {
  quote: string;
  name: string;
  role?: string;
};

export type SignUpValues = {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

/** Colour roles. Each is any CSS colour and defaults to a theme token. */
export type SignUpSplitColors = {
  /** Brand mark, links and the submit button. Default `var(--primary)`. */
  accent?: string;
  /** Form panel surface. Default `var(--card)`. */
  surface?: string;
  /** Tint behind the highlights panel. Default `var(--muted)`. */
  panel?: string;
  /** First wash and the check marks. Default `var(--chart-2)`. */
  highlight?: string;
  /** Second wash in the highlights panel. Default `var(--chart-5)`. */
  glow?: string;
};

export type SignUpSplitProps = Omit<ComponentPropsWithoutRef<"section">, "onSubmit"> & {
  title?: string;
  subtitle?: string;
  brandName?: string;
  brand?: ReactNode;
  providers?: SignUpProvider[];
  highlights?: string[];
  testimonial?: SignUpTestimonial;
  /** May return a promise. The form shows a pending state until it settles. */
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  signInHref?: string;
  termsHref?: string;
  privacyHref?: string;
  colors?: SignUpSplitColors;
};

type Field = "name" | "email" | "password" | "terms";
type FieldErrors = Partial<Record<Field, string>>;
type Status = "idle" | "pending" | "success";

const fieldOrder: Field[] = ["name", "email", "password", "terms"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultProviders: SignUpProvider[] = [
  { id: "passkey", label: "Passkey", icon: <Fingerprint aria-hidden="true" className="size-4" /> },
  { id: "sso", label: "SSO", icon: <KeyRound aria-hidden="true" className="size-4" /> },
  { id: "magic", label: "Email link", icon: <Mail aria-hidden="true" className="size-4" /> },
];

const defaultHighlights = [
  "Free workspace for up to ten teammates",
  "Import projects from your current tools in minutes",
  "Export everything or cancel at any time",
];

const defaultTestimonial: SignUpTestimonial = {
  quote: "We moved the whole team over on a Monday. Nobody needed a training session.",
  name: "Priya Raman",
  role: "Head of operations, Fieldstone",
};

const linkClass =
  "font-medium text-(--sign-up-split-accent) underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50";

// Strength is measured from the password itself: length, then how many
// character classes it mixes. The bar width is score / 4 of the track.
function measurePassword(password: string) {
  if (password.length === 0) return { score: 0, label: "Enter a password", width: 0, tone: "bg-muted" };

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password),
  ).length;
  const raw = (password.length >= 8 ? 1 : 0) + (password.length >= 12 ? 1 : 0) + (classes >= 2 ? 1 : 0) + (classes >= 3 ? 1 : 0);
  const score = Math.max(1, raw);
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const tones = ["bg-destructive", "bg-destructive", "bg-chart-3", "bg-chart-2", "bg-chart-1"];

  return {
    score,
    label: labels[score],
    width: (score / 4) * 100,
    tone: tones[score],
  };
}

function validate(values: SignUpValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name) errors.name = "Enter your full name.";
  if (!emailPattern.test(values.email)) errors.email = "Enter an email like you@company.com.";
  if (values.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!values.acceptedTerms) errors.terms = "Accept the terms to continue.";
  return errors;
}

function themeStyle(colors: SignUpSplitColors | undefined): CSSProperties {
  return {
    "--sign-up-split-accent": colors?.accent ?? "var(--primary)",
    "--sign-up-split-surface": colors?.surface ?? "var(--card)",
    "--sign-up-split-panel": colors?.panel ?? "var(--muted)",
    "--sign-up-split-highlight": colors?.highlight ?? "var(--chart-2)",
    "--sign-up-split-glow": colors?.glow ?? "var(--chart-5)",
  } as CSSProperties;
}

export function SignUpSplit({
  title = "Create your account",
  subtitle = "Start with a free workspace. No credit card needed.",
  brandName = "Northwind",
  brand,
  providers = defaultProviders,
  highlights = defaultHighlights,
  testimonial = defaultTestimonial,
  onSubmit,
  signInHref = "#sign-in",
  termsHref = "#terms",
  privacyHref = "#privacy",
  colors,
  className,
  style,
  ...props
}: SignUpSplitProps) {
  const uid = useId();
  const id = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    password: `${uid}-password`,
    strength: `${uid}-strength`,
    terms: `${uid}-terms`,
  } as const;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [status, setStatus] = useState<Status>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const strength = measurePassword(password);

  // Once a field has an error, clear it as soon as the user changes that field.
  function clearError(field: Field) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;

    const form = new FormData(event.currentTarget);
    const values: SignUpValues = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password,
      acceptedTerms,
    };
    const found = validate(values);
    setErrors(found);
    setFormError(undefined);

    const firstInvalid = fieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(id[firstInvalid])?.focus();
      return;
    }

    setStatus("pending");
    try {
      await onSubmit?.(values);
      setSubmittedEmail(values.email);
      setStatus("success");
    } catch {
      setStatus("idle");
      setFormError("We could not create your account. Try again.");
    }
  }

  const passwordDescribedBy = [id.strength, errors.password ? `${id.password}-error` : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={cn(
        "grid w-full overflow-hidden rounded-xl border bg-(--sign-up-split-surface) shadow-sm md:grid-cols-[1.1fr_0.9fr]",
        className,
      )}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <div className="flex flex-col gap-6 p-6 sm:p-10">
        <div className="flex items-center gap-2.5">
          {brand ?? (
            <span className="flex size-9 items-center justify-center rounded-lg bg-(--sign-up-split-accent) text-primary-foreground">
              <Layers className="size-5" aria-hidden="true" />
            </span>
          )}
          <span className="text-sm font-semibold">{brandName}</span>
        </div>

        <header className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </header>

        {status === "success" ? (
          <div role="status" className="flex flex-col gap-3 rounded-xl border p-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--sign-up-split-highlight)_20%,transparent)] text-(--sign-up-split-highlight)">
              <Check className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium">Account created.</p>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to {submittedEmail}. Open it to finish setting up.
            </p>
          </div>
        ) : (
          <>
            {providers.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {providers.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    onClick={provider.onSelect}
                    className="h-auto min-w-0 flex-col gap-1 px-2 py-2.5 text-xs"
                  >
                    {provider.icon}
                    <span className="truncate">{provider.label}</span>
                  </Button>
                ))}
              </div>
            )}

            {providers.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span>OR</span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
            )}

            <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor={id.name}>Full name</Label>
                <Input
                  id={id.name}
                  name="name"
                  autoComplete="name"
                  placeholder="Jordan Lee"
                  required
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${id.name}-error` : undefined}
                  onChange={() => clearError("name")}
                />
                {errors.name && (
                  <p id={`${id.name}-error`} className="text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={id.email}>Work email</Label>
                <Input
                  id={id.email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? `${id.email}-error` : undefined}
                  onChange={() => clearError("email")}
                />
                {errors.email && (
                  <p id={`${id.email}-error`} className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={id.password}>Password</Label>
                <div className="relative">
                  <Input
                    id={id.password}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="pr-10"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearError("password");
                    }}
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={passwordDescribedBy}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </button>
                </div>
                <div id={id.strength} className="flex items-center gap-3">
                  <div
                    role="meter"
                    aria-label="Password strength"
                    aria-valuemin={0}
                    aria-valuemax={4}
                    aria-valuenow={strength.score}
                    aria-valuetext={strength.label}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", strength.tone)}
                      style={{ width: `${strength.width}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs tabular-nums text-muted-foreground" aria-live="polite">
                    {strength.label}
                  </span>
                </div>
                {errors.password && (
                  <p id={`${id.password}-error`} className="text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id={id.terms}
                    checked={acceptedTerms}
                    onCheckedChange={(value) => {
                      setAcceptedTerms(value === true);
                      clearError("terms");
                    }}
                    required
                    aria-invalid={errors.terms ? true : undefined}
                    aria-describedby={errors.terms ? `${id.terms}-error` : undefined}
                    className="mt-0.5"
                  />
                  <label htmlFor={id.terms} className="text-sm leading-snug text-muted-foreground">
                    I agree to the{" "}
                    <a href={termsHref} className={linkClass}>
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href={privacyHref} className={linkClass}>
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.terms && (
                  <p id={`${id.terms}-error`} className="text-xs text-destructive">
                    {errors.terms}
                  </p>
                )}
              </div>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-(--sign-up-split-accent) text-primary-foreground hover:bg-(--sign-up-split-accent) hover:opacity-90"
                disabled={status === "pending"}
                aria-busy={status === "pending" || undefined}
              >
                {status === "pending" && (
                  <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                )}
                {status === "pending" ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href={signInHref} className={linkClass}>
                Sign in
              </a>
            </p>
          </>
        )}
      </div>

      <aside className="relative isolate flex flex-col justify-between gap-8 overflow-hidden border-t bg-[color-mix(in_oklch,var(--sign-up-split-panel)_40%,transparent)] p-6 sm:p-8 md:border-l md:border-t-0">
        {/* Colour-coded wash, so the panel has presence without an image asset. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 55% at 80% 15%, color-mix(in oklch, var(--sign-up-split-highlight) 45%, transparent), transparent 70%), radial-gradient(70% 60% at 15% 85%, color-mix(in oklch, var(--sign-up-split-glow) 40%, transparent), transparent 70%)",
          }}
        />
        <ul className="flex flex-col gap-3 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--sign-up-split-highlight)_20%,transparent)] text-(--sign-up-split-highlight)">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {testimonial && (
          <figure className="flex flex-col gap-3 rounded-xl border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
            <Quote className="size-5 text-muted-foreground" aria-hidden="true" />
            <blockquote className="text-sm leading-relaxed">{testimonial.quote}</blockquote>
            <figcaption>
              <span className="block text-sm font-medium">{testimonial.name}</span>
              {testimonial.role && <span className="block text-xs text-muted-foreground">{testimonial.role}</span>}
            </figcaption>
          </figure>
        )}
      </aside>
    </section>
  );
}
