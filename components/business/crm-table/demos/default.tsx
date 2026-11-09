import { CrmTable, type CrmDeal, type CrmStage } from "../index";

const stages: CrmStage[] = [
  { id: "new", label: "New", tone: "chart-1" },
  { id: "screening", label: "Screening", tone: "chart-5" },
  { id: "meeting", label: "Meeting", tone: "chart-2" },
  { id: "proposal", label: "Proposal", tone: "chart-3" },
  { id: "customer", label: "Customer", tone: "chart-4" },
];

const deals: CrmDeal[] = [
  { id: "1", name: "Enterprise plan upgrade", company: "Fieldstone Foods", stage: "new", amount: 50000, closeDate: "2026-12-10", owner: "Priya Nair" },
  { id: "2", name: "Design partnership", company: "Quill & Co", stage: "new", amount: 30000, closeDate: "2027-01-15", owner: "Marcus Bell" },
  { id: "3", name: "API integration deal", company: "Kestrel Freight", stage: "screening", amount: 75000, closeDate: "2027-01-25", owner: "Ines Duarte" },
  { id: "4", name: "Workspace expansion", company: "Harbor Health", stage: "meeting", amount: 45000, closeDate: "2026-12-20", owner: "Sarah Chen" },
  { id: "5", name: "Platform migration", company: "Lumen Energy", stage: "proposal", amount: 60000, closeDate: "2027-01-31", owner: "Priya Nair" },
  { id: "6", name: "Model training pilot", company: "Orbit Labs", stage: "customer", amount: 100000, closeDate: "2026-11-15", owner: "Marcus Bell" },
];

export default function Demo() {
  return <CrmTable stages={stages} deals={deals} />;
}
