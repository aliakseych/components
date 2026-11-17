import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Building2, CalendarDays, Cloud, FileText, Landmark, MessageSquare, Table2, Truck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string }>;

export type SetupStepText = { title: ReactNode; description: ReactNode };
export type SetupTool = { label: string; icon: Icon };
export type SetupCheck = { label: string; defaultOn?: boolean };
export type SetupBriefItem = { title: string; detail: string; tone?: "ok" | "warn" | "bad" };
export type SetupBrief = { eyebrow: string; title: string; items: SetupBriefItem[] };

export type SetupStepsProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Text under each of the three cards. */
  steps?: [SetupStepText, SetupStepText, SetupStepText];
  /** Keycaps in the first card (up to 9, shown 3 x 3). */
  tools?: SetupTool[];
  /** Toggle rows in the second card. */
  checks?: SetupCheck[];
  /** Summary card in the third card. */
  brief?: SetupBrief;
  className?: string;
};

const defaultTools: SetupTool[] = [
  { label: "Fleet tracking", icon: Truck },
  { label: "Accounting", icon: Wallet },
  { label: "Team chat", icon: MessageSquare },
  { label: "Calendar", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Bank alerts", icon: Landmark },
  { label: "Spreadsheets", icon: Table2 },
  { label: "Storage", icon: Cloud },
  { label: "CRM", icon: Building2 },
];

const defaultChecks: SetupCheck[] = [
  { label: "Overdue items", defaultOn: true },
  { label: "Pending sign-offs", defaultOn: true },
  { label: "Budget variance", defaultOn: true },
  { label: "Stalled workflows", defaultOn: true },
];

const defaultBrief: SetupBrief = {
  eyebrow: "Morning brief",
  title: "3 things need you today",
  items: [
    { title: "Invoice 4821 does not match the order", detail: "Two records disagree", tone: "bad" },
    { title: "Truck 12 is 3 hours behind", detail: "Customer not yet notified", tone: "warn" },
    { title: "Weekly payroll is ready", detail: "Review and approve", tone: "ok" },
  ],
};

const defaultSteps: [SetupStepText, SetupStepText, SetupStepText] = [
  {
    title: "Link your tools",
    description: (
      <>
        Pick the apps your team relies on
        <br className="hidden min-[1200px]:inline" /> and grant read access.
      </>
    ),
  },
  {
    title: "Choose what to watch",
    description: (
      <>
        Tell us which deadlines, budgets,
        <br className="hidden min-[1200px]:inline" /> and teams deserve a close eye.
      </>
    ),
  },
  {
    title: "Receive a daily digest",
    description: (
      <>
        A short summary lands each morning
        <br className="hidden min-[1200px]:inline" /> with the items to act on first.
      </>
    ),
  },
];

const EASE = "cubic-bezier(.25,.1,.25,1)";

/** Once-only entrance for `[data-reveal]` children of each `[data-reveal-root]`: 800ms text / 1000ms visual, 35% viewport trigger. */
function useEntrance(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-reveal]")];
    const play = (item: HTMLElement) => {
      if (!item.dataset.pending) return;
      delete item.dataset.pending;
      item.style.opacity = "";
      const card = item.dataset.card === "1";
      item.animate(
        [
          { opacity: 0, translate: card ? "0 32px" : "0 18px", scale: card ? "0.96" : "1" },
          { opacity: 1, translate: "0 0", scale: "1" },
        ],
        { duration: card ? 1000 : 800, delay: Number(item.dataset.delay ?? 0), easing: EASE, fill: "backwards" },
      );
    };
    items.forEach((i) => {
      i.dataset.pending = "1";
      i.style.opacity = "0";
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.querySelectorAll<HTMLElement>("[data-reveal]").forEach(play);
        }),
      { threshold: 0, rootMargin: `0px 0px -${Math.round(innerHeight * 0.35)}px 0px` },
    );
    el.querySelectorAll("[data-reveal-root]").forEach((r) => io.observe(r));
    const onFocus = (ev: FocusEvent) => items.forEach((i) => i.contains(ev.target as Node) && play(i));
    el.addEventListener("focusin", onFocus);
    return () => {
      io.disconnect();
      el.removeEventListener("focusin", onFocus);
      items.forEach((i) => {
        delete i.dataset.pending;
        i.style.opacity = "";
      });
    };
  }, [root]);
}

function Keycaps({ tools }: { tools: SetupTool[] }) {
  return (
    <ul className="absolute top-1/2 left-1/2 m-0 grid w-[67.986%] -translate-x-1/2 -translate-y-1/2 list-none grid-cols-3 gap-[4cqw] p-0">
      {tools.slice(0, 9).map(({ label, icon: Glyph }) => (
        <li
          key={label}
          title={label}
          className="flex aspect-square items-center justify-center rounded-[22%] bg-gradient-to-b from-white to-neutral-100 text-neutral-700 shadow-[inset_0_1px_0_#fff,0_2px_0_rgba(0,0,0,.1),0_14px_22px_-8px_rgba(20,30,60,.35)] ring-1 ring-black/5"
        >
          <Glyph className="size-[38%]" />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative block h-7 w-16 flex-none rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-[801px]:max-[1199px]:h-6 min-[801px]:max-[1199px]:w-12 max-[380px]:h-6 max-[380px]:w-12",
        on ? "bg-[#34c759]" : "bg-muted-foreground/30",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 right-0.5 h-6 w-[38px] rounded-full bg-white shadow-sm transition-transform duration-200 min-[801px]:max-[1199px]:h-5 min-[801px]:max-[1199px]:w-[30px] max-[380px]:h-5 max-[380px]:w-[30px]",
          !on && "-translate-x-[22px] min-[801px]:max-[1199px]:-translate-x-[14px] max-[380px]:-translate-x-[14px]",
        )}
      />
    </button>
  );
}

function Checks({ checks }: { checks: SetupCheck[] }) {
  const [state, setState] = useState(() => checks.map((c) => c.defaultOn ?? true));
  return (
    <div className="absolute top-1/2 right-[8.633%] left-[8.633%] flex -translate-y-1/2 flex-col gap-px overflow-hidden rounded-[20px] bg-[#eaeaea] min-[801px]:rounded-3xl dark:bg-[#3a3a3c]">
      {checks.map((c, i) => (
        <div
          key={c.label}
          className="flex min-h-[60px] items-center justify-between gap-2 bg-card py-4 pr-3.5 pl-[18px] text-[15px] leading-5 tracking-[-.23px] text-[#595959] min-[801px]:max-[1199px]:px-3 min-[801px]:max-[1199px]:text-[clamp(11px,1.2vw,15px)] max-[380px]:px-2.5 max-[380px]:py-[13px] max-[380px]:text-xs dark:text-[#a3a3a8]"
        >
          {c.label}
          <Switch label={c.label} on={state[i]} onToggle={() => setState((s) => s.map((v, j) => (j === i ? !v : v)))} />
        </div>
      ))}
    </div>
  );
}

const toneDot = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500" };

function BriefCard({ brief }: { brief: SetupBrief }) {
  return (
    <div className="absolute top-1/2 left-1/2 w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-[6cqw] bg-card p-[5cqw] text-card-foreground shadow-[0_0_20px_rgba(255,255,255,.25),0_18px_40px_-12px_rgba(20,30,60,.35)]">
      <p className="m-0 text-[3cqw] leading-none font-medium tracking-wide text-muted-foreground uppercase">{brief.eyebrow}</p>
      <p className="mt-[2cqw] mb-[3.4cqw] text-[5cqw] leading-tight font-semibold tracking-tight text-foreground">{brief.title}</p>
      <ul className="m-0 flex list-none flex-col gap-[2.2cqw] p-0">
        {brief.items.map((it) => (
          <li key={it.title} className="flex items-start gap-[2.6cqw] rounded-[3.4cqw] bg-muted px-[3cqw] py-[2.6cqw]">
            <span className={cn("mt-[1.4cqw] size-[2.4cqw] flex-none rounded-full", toneDot[it.tone ?? "ok"])} />
            <span className="min-w-0">
              <span className="block text-[3.4cqw] leading-tight font-medium text-foreground">{it.title}</span>
              <span className="block text-[2.9cqw] leading-tight text-muted-foreground">{it.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const backgrounds = [
  "bg-[radial-gradient(120%_90%_at_15%_10%,#f6d6b5_0%,transparent_60%),radial-gradient(100%_100%_at_90%_95%,#5279bf_0%,transparent_65%),linear-gradient(160deg,#a0a6cd,#ddbec9)]",
  "bg-[radial-gradient(110%_90%_at_85%_8%,#c9d4ee_0%,transparent_60%),radial-gradient(100%_100%_at_10%_100%,#284b80_0%,transparent_70%),linear-gradient(200deg,#647da4,#d8bec5)]",
  "bg-[radial-gradient(120%_90%_at_50%_0%,#0647b5_0%,transparent_62%),radial-gradient(100%_80%_at_50%_100%,#f3d4ba_0%,transparent_70%),linear-gradient(180deg,#5279bf,#ddbec9)]",
];
const shades = ["bg-white/20 mix-blend-soft-light", "bg-[rgba(43,43,43,.1)]", "bg-[rgba(43,43,43,.1)]"];

export function SetupSteps({
  title = "Up and running within a week.",
  description = (
    <>
      We link your apps, choose what to
      {" "}
      <br className="max-[800px]:hidden" />
      monitor, and start sending digests.
    </>
  ),
  steps = defaultSteps,
  tools = defaultTools,
  checks = defaultChecks,
  brief = defaultBrief,
  className,
}: SetupStepsProps) {
  const root = useRef<HTMLElement>(null);
  useEntrance(root);
  const visuals = [<Keycaps key="k" tools={tools} />, <Checks key="c" checks={checks} />, <BriefCard key="b" brief={brief} />];

  return (
    <section
      ref={root}
      className={cn(
        "mx-auto w-full max-w-[1296px] px-5 py-20 text-[#1a1a1a] min-[381px]:px-6 min-[801px]:px-8 min-[801px]:py-32 min-[1200px]:px-12 dark:text-[#f5f5f7]",
        className,
      )}
    >
      <div data-reveal-root className="text-center">
        <h2
          data-reveal
          data-delay="0"
          className="m-0 text-[clamp(32px,7vw,44px)] leading-[1.08] font-[590] tracking-[-.23px] min-[1200px]:text-[56px]"
        >
          {title}
        </h2>
        <p
          data-reveal
          data-delay="80"
          className="mx-auto mt-4 max-w-[520px] text-[18px] leading-[25px] tracking-[-.26px] text-[#595959] min-[801px]:max-w-none min-[801px]:text-[22px] min-[801px]:leading-7 dark:text-[#a3a3a8]"
        >
          {description}
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-10 min-[801px]:mt-16 min-[801px]:grid-cols-3 min-[801px]:gap-6">
        {steps.map((step, i) => (
          <article key={i} data-reveal-root className="mx-auto w-full min-w-0 max-w-[456px] min-[801px]:mx-0 min-[801px]:max-w-none">
            <div
              data-reveal
              data-card="1"
              data-delay="0"
              style={{ containerType: "inline-size" }}
              className={cn("relative isolate mb-6 aspect-square w-full overflow-hidden rounded-3xl bg-[#eaeaea] dark:bg-[#2c2c2e]", backgrounds[i])}
            >
              <div aria-hidden className={cn("absolute inset-0", shades[i])} />
              {visuals[i]}
            </div>
            <h3 data-reveal data-delay="80" className="mt-0 mb-3 text-[22px] leading-7 font-bold tracking-[-.26px]">
              {step.title}
            </h3>
            <p data-reveal data-delay="160" className="m-0 text-[20px] leading-[25px] tracking-[-.45px] text-[#595959] min-[801px]:max-[1199px]:text-[18px] dark:text-[#a3a3a8]">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
