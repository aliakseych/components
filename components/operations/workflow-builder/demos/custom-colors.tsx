import { WorkflowBuilder } from "../index";
import type { WorkflowStep } from "../index";

const steps: WorkflowStep[] = [
  { id: "webhook", kind: "trigger", title: "Webhook received", detail: "POST /orders", status: "ok" },
  { id: "validate", kind: "condition", title: "Order is valid", detail: "Field: total", status: "warning" },
  { id: "ship", kind: "action", title: "Create shipment", detail: "Carrier: default", status: "idle" },
];

export default function Demo() {
  return (
    <div className="w-full text-foreground">
      <WorkflowBuilder
        initialSteps={steps}
        colors={{ trigger: "#8b5cf6", action: "#0ea5e9", condition: "#f97316", ok: "#22c55e", warning: "#eab308" }}
      />
    </div>
  );
}
