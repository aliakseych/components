"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { AgentActionSheet } from "@/components/agent/action-sheet";
import { money } from "@/lib/format";
import type { AgentAction } from "@/lib/types";

const STATUS: Record<AgentAction["status"], string> = {
  pending: "Ожидает",
  executed: "Выполнено",
  rejected: "Отклонено",
  failed: "Не выполнено",
};

export function ActionsList({ actions, showStatus = false }: { actions: AgentAction[]; showStatus?: boolean }) {
  const [selected, setSelected] = useState<AgentAction | null>(null);
  const [updates, setUpdates] = useState<Record<number, AgentAction>>({});
  const rows = actions.map((action) => updates[action.id] ?? action).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));

  return <>
    <div className="stagger divide-y divide-border/60">{rows.map((action) => {
      const Icon = action.kind === "invest" ? ArrowUpRight : ArrowDownToLine;
      return <div key={action.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
        <div className="flex min-w-0 items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{action.title}</p><p className="text-sm text-muted-foreground">{action.source}</p></div><p className="tabular max-w-[45%] break-words text-right text-sm font-semibold">{money(action.amount)}</p></div>
        <div className="flex flex-wrap items-center gap-2 pl-14">{showStatus && <span className={`rounded-full px-3 py-2 text-xs font-medium ${action.status === "pending" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{STATUS[action.status]}</span>}<button type="button" onClick={() => setSelected(action)} className="min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">Посмотреть действие</button></div>
      </div>;
    })}</div>
    {selected && <AgentActionSheet key={selected.id} action={selected} open onOpenChange={(open) => { if (!open) setSelected(null); }} onDone={(action) => setUpdates((previous) => ({ ...previous, [action.id]: action }))} />}
  </>;
}
