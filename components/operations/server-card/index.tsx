import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ServerStatus = "online" | "degraded" | "provisioning";

export type ServerUsage = {
  /** Fractions from 0 to 1. */
  cpu: number;
  memory: number;
  disk: number;
};

export type Server = {
  id: string;
  name: string;
  region: string;
  provider: string;
  status: ServerStatus;
  vcpu: number;
  memoryGb: number;
  diskGb: number;
  usage: ServerUsage;
};

export type ServerCardColors = {
  /** Normal meter fill. Default: var(--primary). */
  accent?: string;
  /** Meter fill above 75%. Default: var(--chart-3). */
  warning?: string;
  /** Meter fill above 90%. Default: var(--destructive). */
  critical?: string;
  /** Online status dot. Default: var(--chart-4). */
  online?: string;
  /** Provisioning status dot. Default: var(--muted-foreground). */
  idle?: string;
};

export type ServerCardProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  servers: Server[];
  /** Heading above the grid. */
  title?: string;
  /** Called with the host when its name or card is chosen. Cards are not clickable without it. */
  onSelect?: (server: Server) => void;
  /** Colour roles. Each becomes a `--server-card-*` variable on the root. */
  colors?: ServerCardColors;
};

const statusStyle: Record<ServerStatus, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-[var(--server-card-online)]" },
  degraded: { label: "Degraded", dot: "bg-[var(--server-card-warning)]" },
  provisioning: { label: "Provisioning", dot: "bg-[var(--server-card-idle)]" },
};

function UsageMeter({ label, value }: { label: string; value: number }) {
  const fraction = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(fraction * 100);
  const tone =
    fraction > 0.9
      ? "bg-[var(--server-card-critical)]"
      : fraction > 0.75
        ? "bg-[var(--server-card-warning)]"
        : "bg-[var(--server-card-accent)]";

  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-right font-medium tabular-nums">{percent}%</span>
    </div>
  );
}

/**
 * A grid of host cards: name, region, status, specs and CPU, memory and
 * disk meters. Each meter's width and label come from the same fraction.
 */
export function ServerCard({
  servers,
  title = "Servers",
  onSelect,
  colors,
  className,
  style,
  ...props
}: ServerCardProps) {
  const colorVars = {
    "--server-card-accent": colors?.accent ?? "var(--primary)",
    "--server-card-warning": colors?.warning ?? "var(--chart-3)",
    "--server-card-critical": colors?.critical ?? "var(--destructive)",
    "--server-card-online": colors?.online ?? "var(--chart-4)",
    "--server-card-idle": colors?.idle ?? "var(--muted-foreground)",
  } as CSSProperties;

  return (
    <section
      className={cn("flex flex-col gap-4", className)}
      style={{ ...colorVars, ...style }}
      {...props}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {servers.length} {servers.length === 1 ? "host" : "hosts"}
        </span>
      </header>
      {servers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No servers.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {servers.map((server) => {
            const status = statusStyle[server.status];
            return (
              <article
                key={server.id}
                className="relative flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-mono text-sm font-medium">
                      {onSelect ? (
                        <button
                          type="button"
                          onClick={() => onSelect(server)}
                          className="rounded-sm text-left outline-none after:absolute after:inset-0 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {server.name}
                        </button>
                      ) : (
                        server.name
                      )}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {server.region} · {server.provider}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1.5 font-normal">
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </Badge>
                </div>

                <ul className="grid grid-cols-3 gap-2 text-xs">
                  <li className="flex min-w-0 items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5">
                    <Cpu aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate tabular-nums">
                      {server.vcpu} vCPU
                    </span>
                  </li>
                  <li className="flex min-w-0 items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5">
                    <MemoryStick aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate tabular-nums">
                      {server.memoryGb} GB<span className="sr-only"> memory</span>
                    </span>
                  </li>
                  <li className="flex min-w-0 items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5">
                    <HardDrive aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate tabular-nums">
                      {server.diskGb} GB<span className="sr-only"> disk</span>
                    </span>
                  </li>
                </ul>

                <div className="grid gap-2.5">
                  <UsageMeter label="CPU" value={server.usage.cpu} />
                  <UsageMeter label="Memory" value={server.usage.memory} />
                  <UsageMeter label="Disk" value={server.usage.disk} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
