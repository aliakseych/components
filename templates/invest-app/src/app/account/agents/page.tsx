import { Suspense } from "react";
import { Bot, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TokenManager } from "@/components/agent/token-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/viz/glass-card";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import type { AgentToken } from "@/lib/types";

export default function AgentsPage() {
  useTitle("Подключить ИИ");
  return <><PageHeader title="Подключить ИИ" back="/account" /><main className="space-y-6 p-4 pt-2 pb-32"><Suspense fallback={<Skeleton className="h-96 w-full rounded-[28px]" />}><Agents /></Suspense></main></>;
}

function Agents() {
  const { data: tokens } = useApi<{ items: AgentToken[] }>("/agent/tokens/", { auth: true });
  if (!tokens) return <Skeleton className="h-96 w-full rounded-[28px]" />;
  return <>
    <GlassCard glass className="space-y-4 bg-accent/50"><span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><Bot className="size-6" /></span><div><h1 className="text-2xl font-semibold">Ваш ИИ рядом со счётом</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Claude, ChatGPT или Cursor могут анализировать ваш счёт и предлагать действия. Вы подтверждаете их свайпом.</p></div></GlassCard>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Что может ИИ</h2><GlassCard className="space-y-3">{["Смотреть сделки и компании", "Видеть портфель", "Предлагать вложения и пополнения"].map((item) => <p key={item} className="flex items-start gap-2 text-sm"><Check className="size-5 shrink-0 text-gain" />{item}</p>)}<p className="font-medium">Деньги двигаете только вы — свайпом.</p></GlassCard></section>
    <TokenManager initialTokens={tokens.items} />
  </>;
}
