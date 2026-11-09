import { WorkflowBuilder } from "../index";
import type { WorkflowStep } from "../index";

const steps: WorkflowStep[] = [
  {
    id: "trigger",
    kind: "trigger",
    title: "Form submitted",
    detail: "Website contact form",
    status: "ok",
  },
  {
    id: "crm",
    kind: "action",
    title: "Create CRM record",
    detail: "Map name, email and company",
    status: "ok",
  },
  {
    id: "check-value",
    kind: "condition",
    title: "Deal value over 5,000",
    detail: "Field: estimated_value",
    status: "warning",
  },
  {
    id: "notify",
    kind: "action",
    title: "Notify sales channel",
    detail: "Post to #enterprise-leads",
    status: "idle",
  },
];

export default function Demo() {
  return (
    <div className="w-full text-foreground">
      <WorkflowBuilder initialSteps={steps} />
    </div>
  );
}
