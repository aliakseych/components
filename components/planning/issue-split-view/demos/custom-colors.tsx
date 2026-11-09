import { IssueSplitView } from "../index";
import type { IssueGroup } from "../index";

const groups: IssueGroup[] = [
  {
    state: "Todo",
    color: "chart-1",
    issues: [
      { id: "KES-47", title: "Add keyboard shortcuts to the board", priority: "urgent", assignees: ["Margaret Hamilton"] },
      { id: "KES-50", title: "Document webhook retry policy", priority: "low", labels: ["docs"] },
      { id: "KES-52", title: "Investigate slow search", priority: "none" },
    ],
  },
];

export default function Demo() {
  return (
    <div className="w-full text-foreground">
      <IssueSplitView
        groups={groups}
        defaultSelectedId="KES-47"
        className="md:h-[360px]"
        colors={{ urgent: "#e11d48", high: "#f97316", medium: "#eab308", low: "#22c55e", muted: "#64748b" }}
      />
    </div>
  );
}
