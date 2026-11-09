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
    name: "worker-batch-2",
    region: "us-east-2",
    provider: "Kestrel Compute",
    status: "online",
    vcpu: 8,
    memoryGb: 32,
    diskGb: 320,
    usage: { cpu: 0.78, memory: 0.52, disk: 0.21 },
  },
  {
    id: "srv-4",
    name: "cdn-edge-sj",
    region: "us-west-1",
    provider: "Lumen Edge",
    status: "online",
    vcpu: 2,
    memoryGb: 8,
    diskGb: 80,
    usage: { cpu: 0.12, memory: 0.31, disk: 0.07 },
  },
  {
    id: "srv-5",
    name: "staging-01",
    region: "ap-south-1",
    provider: "Orbit Cloud",
    status: "provisioning",
    vcpu: 2,
    memoryGb: 4,
    diskGb: 40,
    usage: { cpu: 0, memory: 0, disk: 0.02 },
  },
  {
    id: "srv-6",
    name: "queue-acme",
    region: "eu-central-1",
    provider: "Harbor Metal",
    status: "online",
    vcpu: 4,
    memoryGb: 16,
    diskGb: 200,
    usage: { cpu: 0.27, memory: 0.44, disk: 0.56 },
  },
];

export default function Demo() {
  return <ServerCard servers={servers} title="Hosts" onSelect={() => {}} />;
}
