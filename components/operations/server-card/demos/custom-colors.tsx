import { ServerCard } from "../index";
import type { Server } from "../index";

const servers: Server[] = [
  {
    id: "srv-1",
    name: "api-eu-1",
    region: "eu-west-1",
    provider: "Orbit Cloud",
    status: "online",
    vcpu: 4,
    memoryGb: 16,
    diskGb: 160,
    usage: { cpu: 0.42, memory: 0.63, disk: 0.38 },
  },
  {
    id: "srv-2",
    name: "db-primary",
    region: "eu-west-1",
    provider: "Harbor Metal",
    status: "degraded",
    vcpu: 16,
    memoryGb: 64,
    diskGb: 1000,
    usage: { cpu: 0.91, memory: 0.88, disk: 0.94 },
  },
  {
    id: "srv-3",
    name: "staging-01",
    region: "ap-south-1",
    provider: "Orbit Cloud",
    status: "provisioning",
    vcpu: 2,
    memoryGb: 4,
    diskGb: 40,
    usage: { cpu: 0, memory: 0, disk: 0.02 },
  },
];

export default function Demo() {
  return (
    <ServerCard
      servers={servers}
      title="Hosts"
      colors={{ accent: "var(--chart-1)", warning: "var(--chart-5)", critical: "#e11d48", online: "var(--chart-2)" }}
    />
  );
}
