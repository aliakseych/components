import { OrgTree, type OrgTreeNode } from "../index";

const nodes: Record<string, OrgTreeNode> = {
  company: { name: "Company", children: ["ceo"] },
  ceo: { name: "Sarah Chen", role: "CEO", children: ["cto", "coo", "cfo"] },
  cto: { name: "Alex Johnson", role: "CTO", children: ["eng", "design"] },
  coo: { name: "Emma Wilson", role: "COO", children: ["ops", "hr"] },
  cfo: { name: "David Kim", role: "CFO", children: ["finance"] },
  eng: { name: "Michael Rodriguez", role: "Engineering Lead", children: ["dev1", "dev2"] },
  design: { name: "Lisa Park", role: "Design Lead" },
  ops: { name: "James Brown", role: "Operations Manager" },
  hr: { name: "Amy Taylor", role: "HR Manager" },
  finance: { name: "Robert Davis", role: "Finance Manager" },
  dev1: { name: "Tom Harris", role: "Senior Developer" },
  dev2: { name: "Nina Patel", role: "Developer" },
};

export default function Demo() {
  return (
    <div className="mx-auto w-full max-w-xs p-4">
      <OrgTree nodes={nodes} rootId="company" defaultExpanded={["ceo", "cto"]} />
    </div>
  );
}
