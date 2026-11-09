import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ActionsList } from "@/components/agent/actions-list";
import { GlassCard } from "@/components/viz/glass-card";
import { plural } from "@/lib/format";
import type { AgentAction } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export function AgentActionsBanner() {
  const { data: actions } = useApi<{ items: AgentAction[] }>("/agent/actions/?status=pending");
  if (!actions?.items.length) return null;

  return <GlassCard glass className="space-y-4 bg-accent/50">
    <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5 text-accent-foreground" />ИИ предлагает {actions.items.length} {plural(actions.items.length, ["действие", "действия", "действий"])}</h2><Link href="/account#agent-actions" className="flex min-h-11 items-center text-sm font-medium">Все</Link></div>
    <ActionsList actions={actions.items.slice(0, 2)} />
  </GlassCard>;
}
