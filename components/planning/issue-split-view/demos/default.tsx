import { IssueSplitView } from "../index";
import type { IssueGroup } from "../index";

const groups: IssueGroup[] = [
  {
    state: "In progress",
    color: "chart-2",
    issues: [
      {
        id: "KES-41",
        title: "Login fails after password reset",
        priority: "urgent",
        assignees: ["Ada Lovelace", "Grace Hopper"],
        labels: ["auth", "bug"],
        description: "Users who reset their password are sent back to the sign-in page with no error. Reproduced on Safari and Chrome.",
        startDate: "2026-10-28",
        dueDate: "2026-11-07",
      },
      {
        id: "KES-44",
        title: "Export invoices as CSV",
        priority: "high",
        assignees: ["Linus Byte"],
        labels: ["billing"],
        startDate: "2026-11-02",
        dueDate: "2026-11-14",
      },
    ],
  },
  {
    state: "Todo",
    color: "chart-1",
    issues: [
      {
        id: "KES-47",
        title: "Add keyboard shortcuts to the board",
        priority: "medium",
        assignees: ["Margaret Hamilton"],
        labels: ["ux"],
      },
      {
        id: "KES-50",
        title: "Document webhook retry policy",
        priority: "low",
        labels: ["docs"],
      },
    ],
  },
  {
    state: "Backlog",
    color: "#94a3b8",
    issues: [
      {
        id: "KES-52",
        title: "Investigate slow search on large workspaces",
        priority: "none",
        description: "No timings yet. Start with the workspace that has more than 40,000 records.",
      },
    ],
  },
  {
    state: "Done",
    color: "chart-4",
    issues: [
      {
        id: "KES-38",
        title: "Rotate API signing keys",
        priority: "high",
        assignees: ["Ada Lovelace"],
        labels: ["security"],
        dueDate: "2026-10-30",
      },
    ],
  },
];

export default function Demo() {
  return (
    <div className="w-full text-foreground">
      <IssueSplitView groups={groups} defaultSelectedId="KES-41" className="md:h-[600px]" />
    </div>
  );
}
