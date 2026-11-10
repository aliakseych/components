import type {
  StatusIncident,
  StatusService,
  StatusUptimeDay,
  ServiceStatus,
} from "../index";

export const NOW = "2026-09-04T14:30:00Z";
const DAY_MS = 86_400_000;
const END = Date.UTC(2026, 8, 4);

/** 90 days, oldest first; `bad` maps days-ago to a status. */
function days(bad: Record<number, StatusUptimeDay["status"]> = {}): StatusUptimeDay[] {
  return Array.from({ length: 90 }, (_, i) => {
    const ago = 89 - i;
    const status = bad[ago] ?? "up";
    return {
      date: new Date(END - ago * DAY_MS).toISOString().slice(0, 10),
      status,
      label: status === "up" ? "No incidents" : status === "degraded" ? "97.80% availability" : "82.10% availability",
    };
  });
}

function service(
  id: string,
  name: string,
  region: string,
  status: ServiceStatus,
  bad?: Record<number, StatusUptimeDay["status"]>,
): StatusService {
  return { id, name, region, status, days: days(bad) };
}

export const healthyServices: StatusService[] = [
  service("api", "Public API", "North America", "operational", { 41: "degraded" }),
  service("web", "Dashboard", "North America", "operational"),
  service("jobs", "Background jobs", "Europe", "operational", { 17: "degraded", 3: "degraded" }),
  service("hooks", "Webhooks", "Europe", "operational"),
  service("cdn", "Asset delivery", "Asia Pacific", "operational", { 60: "down" }),
];

export const incidentServices: StatusService[] = [
  service("api", "Public API", "North America", "degraded", { 0: "degraded", 41: "degraded" }),
  service("web", "Dashboard", "North America", "operational"),
  service("jobs", "Background jobs", "Europe", "outage", { 0: "down", 17: "degraded", 3: "degraded" }),
  service("hooks", "Webhooks", "Europe", "maintenance"),
  service("cdn", "Asset delivery", "Asia Pacific", "operational", { 60: "down" }),
];

export const resolvedIncidents: StatusIncident[] = [
  {
    id: "inc-3",
    title: "Elevated error rate on the public API",
    severity: "major",
    status: "resolved",
    startedAt: "2026-09-02T09:12:00Z",
    resolvedAt: "2026-09-02T10:41:00Z",
    affected: ["Public API"],
    updates: [
      { at: "2026-09-02T10:41:00Z", status: "resolved", message: "Error rates are back to baseline." },
      { at: "2026-09-02T09:58:00Z", status: "monitoring", message: "A fix is rolled out. We are watching error rates." },
      { at: "2026-09-02T09:31:00Z", status: "identified", message: "A bad connection-pool setting was found after the 09:00 deploy." },
      { at: "2026-09-02T09:12:00Z", status: "investigating", message: "We are seeing a rise in 5xx responses." },
    ],
  },
  {
    id: "inc-2",
    title: "Delayed webhook deliveries",
    severity: "minor",
    status: "resolved",
    startedAt: "2026-08-27T16:05:00Z",
    resolvedAt: "2026-08-27T16:50:00Z",
    affected: ["Webhooks"],
    updates: [
      { at: "2026-08-27T16:50:00Z", status: "resolved", message: "The backlog has drained." },
      { at: "2026-08-27T16:05:00Z", status: "investigating", message: "Deliveries are arriving several minutes late." },
    ],
  },
];

export const activeIncident: StatusIncident = {
  id: "inc-4",
  title: "Background jobs are not starting",
  severity: "critical",
  status: "identified",
  startedAt: "2026-09-04T13:20:00Z",
  affected: ["Background jobs", "Public API"],
  updates: [
    { at: "2026-09-04T14:10:00Z", status: "identified", message: "A stuck queue worker pool is the cause. We are replacing it." },
    { at: "2026-09-04T13:20:00Z", status: "investigating", message: "Queued jobs are not being picked up in Europe." },
  ],
};

export const brand = { name: "Meridian", initial: "M", caption: "Status" };
