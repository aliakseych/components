import * as React from "react";
import {
  ActivityIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  SearchIcon,
  TriangleAlertIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* Ported from the Vibra `engineering-status` block (`npx shadcn@latest add @vibra/engineering-status`).
   The Vibra ui parts it leans on (status badge, live pulse, system status, uptime bar, timeline,
   section header) are inlined below so the folder stays self-contained. */

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";
export type UptimeDayStatus = "up" | "degraded" | "down" | "none";
export type IncidentSeverity = "critical" | "major" | "minor" | "info";
export type IncidentStage = "investigating" | "identified" | "monitoring" | "resolved";

export type StatusUptimeDay = {
  /** ISO date, read in UTC. */
  date: string;
  status: UptimeDayStatus;
  /** Detail read after the status, e.g. "99.12% availability". */
  label?: string;
};

export type StatusService = {
  id: string;
  name: string;
  /** Region the service runs in; the regions banner groups by it. */
  region: string;
  status: ServiceStatus;
  /** Daily record, oldest first. */
  days: StatusUptimeDay[];
  /** Stated availability. Defaults to the share of measured days that stayed up. */
  uptime?: number;
};

export type StatusUpdate = { at: Date | string; status: IncidentStage; message: string };

export type StatusIncident = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStage;
  startedAt: Date | string;
  resolvedAt?: Date | string;
  affected: string[];
  updates: StatusUpdate[];
};

export type EngineeringStatusBrand = { name: string; initial: string; caption?: string };

/** Palette roles; each takes any CSS colour. Defaults are theme tokens. */
export type EngineeringStatusColors = {
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  brand?: string;
  brandForeground?: string;
};

export type EngineeringStatusProps = Omit<React.ComponentProps<"div">, "title"> & {
  brand: EngineeringStatusBrand;
  services: StatusService[];
  incidents: StatusIncident[];
  /** "Now" for the page: dates the banner, the history window and the quiet-day runs. */
  now: Date | string;
  title?: React.ReactNode;
  /** Days of incident history published. */
  historyDays?: number;
  colors?: EngineeringStatusColors;
};

const DAY_MS = 86_400_000;
const at = (d: Date | string) => (d instanceof Date ? d : new Date(d));

/* Every date is UTC: the page says so, and a reader comparing against logs needs one zone. */
const fmt = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...o, timeZone: "UTC" });
const DAY_HEADING = fmt({ dateStyle: "long" });
const DATE_ONLY = fmt({ dateStyle: "medium" });
const TIME_ONLY = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const STAMP = fmt({
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const stamp = (d: Date | string) => `${STAMP.format(at(d))} UTC`;
const clock = (d: Date | string) => `${TIME_ONLY.format(at(d))} UTC`;

function formatDuration(ms: number): string {
  const m = Math.max(1, Math.round(ms / 60_000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`;
}

/* ───────── tones ───────── */

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

// Literal classes: Tailwind reads source text, so names are never interpolated.
const TONE_TEXT: Record<Tone, string> = {
  success: "text-(--engineering-status-success)",
  warning: "text-(--engineering-status-warning)",
  danger: "text-(--engineering-status-danger)",
  info: "text-(--engineering-status-info)",
  neutral: "text-muted-foreground",
};
const TONE_BG: Record<Tone, string> = {
  success: "bg-(--engineering-status-success)",
  warning: "bg-(--engineering-status-warning)",
  danger: "bg-(--engineering-status-danger)",
  info: "bg-(--engineering-status-info)",
  neutral: "bg-muted-foreground",
};
// Tinted fill + hairline in the tone, built from the same variable.
const TONE_TINT: Record<Tone, string> = {
  success:
    "bg-[color-mix(in_oklch,var(--engineering-status-success)_14%,transparent)] text-(--engineering-status-success)",
  warning:
    "bg-[color-mix(in_oklch,var(--engineering-status-warning)_14%,transparent)] text-(--engineering-status-warning)",
  danger:
    "bg-[color-mix(in_oklch,var(--engineering-status-danger)_14%,transparent)] text-(--engineering-status-danger)",
  info: "bg-[color-mix(in_oklch,var(--engineering-status-info)_14%,transparent)] text-(--engineering-status-info)",
  neutral: "bg-muted text-muted-foreground",
};
const TONE_BORDER: Record<Tone, string> = {
  success: "border-[color-mix(in_oklch,var(--engineering-status-success)_30%,transparent)]",
  warning: "border-[color-mix(in_oklch,var(--engineering-status-warning)_30%,transparent)]",
  danger: "border-[color-mix(in_oklch,var(--engineering-status-danger)_30%,transparent)]",
  info: "border-[color-mix(in_oklch,var(--engineering-status-info)_30%,transparent)]",
  neutral: "border-border",
};

const SERVICE_TONE: Record<ServiceStatus, Tone> = {
  operational: "success",
  degraded: "warning",
  outage: "danger",
  maintenance: "info",
};
const SERVICE_LABEL: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
};
const OVERALL_HEADLINE: Record<ServiceStatus, string> = {
  operational: "All systems operational",
  degraded: "Partial outage",
  outage: "Major outage",
  maintenance: "Under maintenance",
};
const OVERALL_ICON: Record<ServiceStatus, LucideIcon> = {
  operational: CircleCheckIcon,
  degraded: TriangleAlertIcon,
  outage: OctagonAlertIcon,
  maintenance: WrenchIcon,
};
// Worst first: one outage outranks every degradation under it.
const SEVERITY_ORDER: ServiceStatus[] = ["outage", "degraded", "maintenance", "operational"];
const worst = (list: ServiceStatus[]): ServiceStatus =>
  SEVERITY_ORDER.find((s) => list.includes(s)) ?? "operational";

const SEV_TONE: Record<IncidentSeverity, Tone> = {
  critical: "danger",
  major: "warning",
  minor: "info",
  info: "neutral",
};
const SEV_LABEL: Record<IncidentSeverity, string> = {
  critical: "Critical",
  major: "Major",
  minor: "Minor",
  info: "Info",
};
const SEV_ICON: Record<IncidentSeverity, LucideIcon> = {
  critical: OctagonAlertIcon,
  major: TriangleAlertIcon,
  minor: CircleAlertIcon,
  info: InfoIcon,
};
const STAGE_LABEL: Record<IncidentStage, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};
const STAGE_TONE: Record<IncidentStage, Tone> = {
  investigating: "danger",
  identified: "warning",
  monitoring: "info",
  resolved: "success",
};
const STAGE_ICON: Record<IncidentStage, LucideIcon> = {
  investigating: SearchIcon,
  identified: WrenchIcon,
  monitoring: ActivityIcon,
  resolved: CircleCheckIcon,
};

/* ───────── small parts ───────── */

const panel = "rounded-xl border bg-card text-card-foreground";

function Pill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-fit items-center gap-1 rounded-full border px-1.5 text-[10px] font-medium whitespace-nowrap [&_svg]:shrink-0",
        TONE_TINT[tone],
        TONE_BORDER[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

function LivePulse({ tone, label, pulsing = true }: { tone: Tone; label: string; pulsing?: boolean }) {
  return (
    <span role="status" className="inline-flex w-fit items-center gap-2 text-xs font-medium">
      <span aria-hidden="true" className="relative flex size-2 shrink-0">
        {pulsing ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-70 [animation-duration:1.6s] motion-reduce:hidden",
              TONE_BG[tone],
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-full rounded-full", TONE_BG[tone])} />
      </span>
      <span className={tone === "neutral" ? "text-muted-foreground" : undefined}>{label}</span>
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-xl font-medium">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ───────── regions banner ───────── */

function Regions({
  services,
  now,
  title,
}: {
  services: StatusService[];
  now: Date | string;
  title: string;
}) {
  const overall = worst(services.map((s) => s.status));
  const OverallIcon = OVERALL_ICON[overall];
  const names = [...new Set(services.map((s) => s.region))];
  const regions = names
    .map((name) => {
      const here = services.filter((s) => s.region === name);
      return {
        name,
        status: worst(here.map((s) => s.status)),
        description: `${here.length} ${here.length === 1 ? "service" : "services"}`,
      };
    })
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.status) - SEVERITY_ORDER.indexOf(b.status));

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">Updated {stamp(now)}</span>
      </div>
      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
          TONE_TINT[SERVICE_TONE[overall]],
        )}
      >
        <OverallIcon aria-hidden="true" className="size-4 shrink-0" />
        {OVERALL_HEADLINE[overall]}
      </div>
      <div className="flex flex-col divide-y rounded-lg border">
        {regions.map((region) => (
          <div key={region.name} className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{region.name}</span>
              <span className="truncate text-xs text-muted-foreground">{region.description}</span>
            </span>
            <span
              className={cn(
                "flex shrink-0 items-center gap-2 text-xs font-medium",
                region.status === "operational" ? "text-muted-foreground" : TONE_TEXT[SERVICE_TONE[region.status]],
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", TONE_BG[SERVICE_TONE[region.status]])}
              />
              {SERVICE_LABEL[region.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── service uptime ───────── */

const DAY_BG: Record<UptimeDayStatus, string> = {
  up: TONE_BG.success,
  degraded: TONE_BG.warning,
  down: TONE_BG.danger,
  none: "bg-muted",
};
const DAY_LABEL: Record<UptimeDayStatus, string> = {
  up: "Operational",
  degraded: "Degraded",
  down: "Down",
  none: "No data",
};
const DAY_WEIGHT: Partial<Record<UptimeDayStatus, number>> = { up: 1, degraded: 0.5, down: 0 };

function computeUptime(days: StatusUptimeDay[]): number {
  let counted = 0;
  let earned = 0;
  for (const d of days) {
    const w = DAY_WEIGHT[d.status];
    if (w === undefined) continue;
    counted += 1;
    earned += w;
  }
  return counted === 0 ? 100 : Math.round((earned / counted) * 10000) / 100;
}
const uptimeText = (p: number) => (Number.isInteger(p) ? `${p}%` : `${p.toFixed(2)}%`);

function ServiceRow({ service }: { service: StatusService }) {
  const percent = service.uptime ?? computeUptime(service.days);
  const reading = `${uptimeText(percent)} uptime`;
  return (
    <li className="flex flex-col gap-2 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{service.name}</span>
          <Pill tone={SERVICE_TONE[service.status]}>{SERVICE_LABEL[service.status]}</Pill>
        </span>
        <span className="shrink-0 text-xs font-medium tabular-nums">{reading}</span>
      </div>
      <div
        role="group"
        aria-label={`${service.name}, ${service.days.length} days, ${reading}`}
        className="flex h-6 w-full items-stretch gap-px"
      >
        {service.days.map((day, i) => {
          const date = DATE_ONLY.format(at(day.date));
          const detail = day.label ? `${DAY_LABEL[day.status]}. ${day.label}` : DAY_LABEL[day.status];
          return (
            <span
              key={i}
              role="img"
              aria-label={`${date}: ${detail}`}
              title={`${date}: ${detail}`}
              className={cn("min-w-0 flex-1 rounded-[2px]", DAY_BG[day.status])}
            />
          );
        })}
      </div>
    </li>
  );
}

function ServiceUptime({ services }: { services: StatusService[] }) {
  const first = services[0]?.days[0];
  const last = services[0]?.days[services[0].days.length - 1];
  return (
    <div className="flex flex-col gap-2">
      <ul className={cn("flex flex-col divide-y", panel)}>
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </ul>
      {first && last ? (
        <div className="flex items-baseline justify-between gap-3 px-1 text-xs text-muted-foreground">
          <span>{DATE_ONLY.format(at(first.date))}</span>
          <span>{DATE_ONLY.format(at(last.date))}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ───────── incidents ───────── */

function IncidentEntry({
  incident,
  showDate = false,
  TitleTag = "h4",
}: {
  incident: StatusIncident;
  showDate?: boolean;
  TitleTag?: "h3" | "h4";
}) {
  const ran = incident.resolvedAt
    ? formatDuration(at(incident.resolvedAt).getTime() - at(incident.startedAt).getTime())
    : null;
  const SeverityIcon = SEV_ICON[incident.severity];
  const updates = [...incident.updates].sort((a, b) => at(b.at).getTime() - at(a.at).getTime());

  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={SEV_TONE[incident.severity]}>
            <SeverityIcon aria-hidden="true" className="size-3" />
            {SEV_LABEL[incident.severity]}
          </Pill>
          <TitleTag className="text-sm font-medium text-pretty">{incident.title}</TitleTag>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {showDate ? `Started ${stamp(incident.startedAt)}` : `Started ${clock(incident.startedAt)}`}
          </span>
          {ran ? <span>{`Resolved in ${ran}`}</span> : null}
          {incident.affected.length > 0 ? (
            <span>
              <span className="sr-only">Affected: </span>
              {incident.affected.join(", ")}
            </span>
          ) : null}
        </p>
      </div>
      <ol className="flex flex-col">
        {updates.map((update, index) => {
          const Icon = STAGE_ICON[update.status];
          return (
            <li
              key={`${incident.id}-${index}`}
              className="relative flex gap-3 pb-5 before:absolute before:start-[11px] before:top-6 before:bottom-0 before:w-px before:bg-border last:pb-0 last:before:hidden"
            >
              <span
                className={cn(
                  "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ring-4 ring-card [&_svg]:size-3",
                  TONE_TINT[STAGE_TONE[update.status]],
                )}
              >
                <Icon aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium">{STAGE_LABEL[update.status]}</span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {stamp(update.at)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{update.message}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

type HistoryEntry =
  | { kind: "day"; key: string; label: string; incidents: StatusIncident[] }
  | { kind: "quiet"; key: string; from: string; to: string; days: number };

/** Collapses runs of quiet days into one line; days arrive newest first. */
function buildHistory(incidents: StatusIncident[], now: Date | string, count: number): HistoryEntry[] {
  const n = at(now);
  const midnight = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  const closed = incidents.filter((i) => i.status === "resolved");
  const days = Array.from({ length: count }, (_, index) => {
    const d = new Date(midnight - index * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: DAY_HEADING.format(d),
      incidents: closed
        .filter((i) => at(i.startedAt).toISOString().slice(0, 10) === key)
        .sort((a, b) => at(b.startedAt).getTime() - at(a.startedAt).getTime()),
    };
  });
  const out: HistoryEntry[] = [];
  for (let i = 0; i < days.length; ) {
    if (days[i].incidents.length > 0) {
      out.push({ kind: "day", ...days[i] });
      i += 1;
      continue;
    }
    let end = i;
    while (end + 1 < days.length && days[end + 1].incidents.length === 0) end += 1;
    out.push({
      kind: "quiet",
      key: `quiet-${days[i].key}`,
      from: DATE_ONLY.format(new Date(`${days[end].key}T00:00:00Z`)),
      to: DATE_ONLY.format(new Date(`${days[i].key}T00:00:00Z`)),
      days: end - i + 1,
    });
    i = end + 1;
  }
  return out;
}

const SEVERITY_PULSE: { severity: IncidentSeverity; tone: Tone }[] = [
  { severity: "critical", tone: "danger" },
  { severity: "major", tone: "danger" },
  { severity: "minor", tone: "warning" },
  { severity: "info", tone: "info" },
];

function ActiveSignal({ incidents }: { incidents: StatusIncident[] }) {
  if (incidents.length === 0) return <LivePulse tone="success" pulsing={false} label="Nothing open" />;
  const top = SEVERITY_PULSE.find((e) => incidents.some((i) => i.severity === e.severity));
  return <LivePulse tone={top?.tone ?? "warning"} label={`${incidents.length} open, being worked on`} />;
}

/* ───────── page ───────── */

export function EngineeringStatus({
  brand,
  services,
  incidents,
  now,
  title = "Platform status",
  historyDays = 14,
  colors,
  className,
  style,
  ...props
}: EngineeringStatusProps) {
  const active = incidents
    .filter((i) => i.status !== "resolved")
    .sort((a, b) => at(b.startedAt).getTime() - at(a.startedAt).getTime());
  const history = buildHistory(incidents, now, historyDays);

  const vars = {
    "--engineering-status-success": colors?.success ?? "oklch(0.62 0.17 150)",
    "--engineering-status-warning": colors?.warning ?? "oklch(0.72 0.16 70)",
    "--engineering-status-danger": colors?.danger ?? "var(--destructive)",
    "--engineering-status-info": colors?.info ?? "oklch(0.6 0.17 255)",
    "--engineering-status-brand": colors?.brand ?? "var(--primary)",
    "--engineering-status-brand-fg": colors?.brandForeground ?? "var(--primary-foreground)",
    ...style,
  } as React.CSSProperties;

  return (
    <div
      data-slot="engineering-status"
      className={cn("flex w-full flex-col text-foreground", className)}
      style={vars}
      {...props}
    >
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--engineering-status-brand) text-xs font-semibold text-(--engineering-status-brand-fg)"
            >
              {brand.initial}
            </span>
            <span className="text-sm font-semibold">{brand.name}</span>
            {brand.caption ? <span className="text-sm text-muted-foreground">{brand.caption}</span> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Availability for every part of {brand.name}, published as our probes measure it.
          </p>
          <p className="text-xs text-muted-foreground">All times UTC</p>
        </div>

        <Regions services={services} now={now} title="Regions" />

        <section aria-label="Services" className="flex flex-col gap-3">
          <SectionHeader
            eyebrow="Availability"
            title="Services"
            description={`Daily availability over the last ${services[0]?.days.length ?? 0} days.`}
          />
          <ServiceUptime services={services} />
        </section>

        <section aria-label="Active incidents" className="flex flex-col gap-3">
          <SectionHeader
            eyebrow="Right now"
            title="Active incidents"
            description="Anything we are still working on, newest first."
            actions={<ActiveSignal incidents={active} />}
          />
          {active.length === 0 ? (
            <p className={cn("px-4 py-8 text-center text-sm text-muted-foreground", panel)}>
              No incidents in progress.
            </p>
          ) : (
            <div className={cn("flex flex-col divide-y", panel)}>
              {active.map((incident) => (
                <div key={incident.id} className="px-4 py-3.5">
                  <IncidentEntry incident={incident} TitleTag="h3" showDate />
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Past incidents" className="flex flex-col gap-3">
          <SectionHeader
            eyebrow="History"
            title="Past incidents"
            description={`The last ${historyDays} days. Anything still open is above.`}
          />
          <ol className={cn("flex flex-col divide-y", panel)}>
            {history.map((entry) =>
              entry.kind === "quiet" ? (
                <li key={entry.key} className="px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    {entry.days === 1 ? `No incidents ${entry.to}.` : `No incidents ${entry.from} – ${entry.to}.`}
                  </p>
                </li>
              ) : (
                <li key={entry.key} className="flex flex-col gap-3 px-4 py-3.5">
                  <h3 className="text-sm font-medium">{entry.label}</h3>
                  {entry.incidents.map((incident) => (
                    <IncidentEntry key={incident.id} incident={incident} />
                  ))}
                </li>
              ),
            )}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 text-xs text-muted-foreground">
          {brand.name} publishes uptime for the last {services[0]?.days.length ?? 0} days. Historical
          incidents stay on this page once they are resolved.
        </div>
      </footer>
    </div>
  );
}
