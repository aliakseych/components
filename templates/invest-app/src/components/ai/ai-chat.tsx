"use client";

import { usePathname } from "next/navigation";
import { ArrowDown, Building2, FileText, RotateCcw, SlidersHorizontal, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { AgentActionSheet } from "@/components/agent/action-sheet";
import { Calculator } from "@/components/deal/calculator";
import { AnswerChart } from "@/components/ai/answer-chart";
import { ChatBubble, RichText } from "@/components/ai/chat-bubble";
import { ChatComposer } from "@/components/ai/chat-composer";
import { DealChip } from "@/components/ai/deal-chip";
import { AnswerSkeleton } from "@/components/ai/ai-skeletons";
import { Thinking } from "@/components/ai/thinking";
import { api } from "@/lib/api";
import { attachScrollEdges } from "@/lib/motion";
import type { AskAiDetail } from "@/lib/ask-ai";
import { CATEGORY_ICON, CATEGORY_LABEL, money } from "@/lib/format";
import type { AgentAction, AiChart, AiMessage, AiReply, DealDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getConfig } from "@/template.config";

type ChatContext = { page?: string; deal_id?: number; company_id?: number; pool?: string; block?: string; filters?: string; mode?: "chat" | "onboarding" };
type MessageContext = { label: string; kind: "deal" | "company" | "pool" | "filters" | "block"; deal_id?: number; pool?: string };
type ChatMessage = AiMessage & { suggestions?: string[]; deal_ids?: number[]; chart?: AiChart | null; action?: AgentAction | null; calc?: AiReply["calc"]; thoughtSeconds?: number; ctx?: MessageContext };
type QueuedQuestion = AskAiDetail & { page: string };
type AiChatProps = { context?: ChatContext; starters?: string[]; className?: string; onDealClick?: () => void; queuedQuestion?: QueuedQuestion; onQuestionConsumed?: () => void };

export const chatStorageKey = () => `${getConfig().brand.storageKey}-ai-chat`;
const HOME_STARTERS = ["Куда вложить 5млн?", "Как это работает?", "Это безопасно?", "Когда мои выплаты?"];
const DEAL_STARTERS = ["Стоит ли вкладывать?", "Что если цена упадёт?", "Сколько получу с 10млн?", "Кто этот бизнес?"];
const ACCOUNT_STARTERS = ["Когда мои выплаты?", "Сколько я заработал?", "Куда вложить свободные деньги?", "Как вывести деньги?"];
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function makeMessageContext(detail: AskAiDetail, context: ChatContext, deals: Record<number, DealDetail | null>): MessageContext | undefined {
  // Блок, совпадающий с видом контекста («Пул», «Компания»), не дублируем в плашке.
  const suffix = detail.block && !["Пул", "Компания"].includes(detail.block) && !detail.block.startsWith("Сделки") ? ` · ${detail.block}` : "";
  if (context.deal_id) return { kind: "deal", deal_id: context.deal_id, label: `${detail.title ?? deals[context.deal_id]?.ticker ?? "Сделка"}${suffix}` };
  if (context.company_id) return { kind: "company", label: `Компания${detail.title ? ` ${detail.title}` : ""}${suffix}` };
  if (detail.pool) return { kind: "pool", pool: detail.pool, label: `Пул · ${detail.title ?? CATEGORY_LABEL[detail.pool as keyof typeof CATEGORY_LABEL] ?? detail.pool}${suffix}` };
  if (detail.filters) return { kind: "filters", label: `Фильтры: ${detail.filters}${suffix}` };
  if (detail.block) return { kind: "block", label: detail.block };
}

function ContextPill({ ctx, deals }: { ctx: MessageContext; deals: Record<number, DealDetail | null> }) {
  const category = ctx.kind === "deal" && ctx.deal_id ? deals[ctx.deal_id]?.category : ctx.pool;
  const Icon = ctx.kind === "company" ? Building2 : ctx.kind === "filters" ? SlidersHorizontal : (category && CATEGORY_ICON[category as keyof typeof CATEGORY_ICON]) || FileText;
  const label = ctx.kind === "deal" && ctx.deal_id && ctx.label.startsWith("Сделка") && deals[ctx.deal_id] ? ctx.label.replace(/^Сделка/, deals[ctx.deal_id]!.ticker) : ctx.label;
  return <div className="flex justify-end"><span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent/60 px-3 py-1 text-xs text-accent-foreground"><Icon className="size-3.5 shrink-0" /><span>{label}</span></span></div>;
}

export function AiChat(props: AiChatProps) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return hydrated ? <ChatContent {...props} /> : null;
}

function ChatEdges() {
  const { scrollRef } = useStickToBottomContext();
  useEffect(() => (scrollRef.current ? attachScrollEdges(scrollRef.current) : undefined), [scrollRef]);
  return null;
}

function ScrollDown() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  return !isAtBottom ? <button type="button" onClick={() => void scrollToBottom()} aria-label="Вниз" className="absolute bottom-3 right-4 flex size-11 items-center justify-center rounded-full bg-card shadow-md"><ArrowDown className="size-5" /></button> : null;
}

function ChatContent({ context, starters, className, onDealClick, queuedQuestion, onQuestionConsumed }: AiChatProps) {
  const pathname = usePathname() || "/";
  const page = context?.page ?? pathname;
  const dealMatch = page.match(/^\/(?:deals|portfolio)\/(\d+)(?:\/|$)/);
  const companyMatch = page.match(/^\/companies\/(\d+)(?:\/|$)/);
  const requestContext = { ...context, page, deal_id: context?.deal_id ?? (dealMatch ? Number(dealMatch[1]) : undefined), company_id: context?.company_id ?? (companyMatch ? Number(companyMatch[1]) : undefined) };
  const questions = starters ?? (page.startsWith("/deals/") ? DEAL_STARTERS : page.startsWith("/portfolio") || page.startsWith("/account") ? ACCOUNT_STARTERS : HOME_STARTERS);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(chatStorageKey()) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((item): item is ChatMessage => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string") : [];
    } catch { return []; }
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorThoughtSeconds, setErrorThoughtSeconds] = useState<number | null>(null);
  const [deals, setDeals] = useState<Record<number, DealDetail | null>>({});
  const [action, setAction] = useState<AgentAction | null>(null);
  const requested = useRef(new Set<number>());
  const generation = useRef(0);
  const busy = useRef(false);
  const activeContext = useRef<ChatContext | null>(null);

  useEffect(() => { try { sessionStorage.setItem(chatStorageKey(), JSON.stringify(messages)); } catch { /* Storage is optional. */ } }, [messages]);
  useEffect(() => {
    for (const id of messages.flatMap((message) => [...(message.deal_ids ?? []), ...(message.calc ? [message.calc.deal_id] : []), ...(message.ctx?.deal_id ? [message.ctx.deal_id] : [])])) {
      if (requested.current.has(id)) continue;
      requested.current.add(id);
      api<DealDetail>(`/deals/${id}/`).then((deal) => setDeals((current) => ({ ...current, [id]: deal }))).catch(() => setDeals((current) => ({ ...current, [id]: null })));
    }
  }, [messages]);

  async function request(history: ChatMessage[], requestCtx: ChatContext) {
    if (busy.current) return;
    busy.current = true;
    const currentGeneration = generation.current;
    const startedAt = performance.now();
    setPending(true);
    setError(null);
    setErrorThoughtSeconds(null);
    try {
      const result = await api<AiReply>("/ai/chat/", { method: "POST", body: JSON.stringify({ messages: history.slice(-20).map(({ role, content }) => ({ role, content })), context: requestCtx }) });
      if (generation.current === currentGeneration) setMessages((current) => [...current, { role: "assistant", content: result.reply, suggestions: result.suggestions, deal_ids: result.deal_ids, chart: result.chart, action: result.action, calc: result.calc, thoughtSeconds: (performance.now() - startedAt) / 1000 }]);
    } catch (err) {
      if (generation.current === currentGeneration) {
        setError(err instanceof Error ? err.message : "ИИ сейчас недоступен");
        setErrorThoughtSeconds((performance.now() - startedAt) / 1000);
      }
    } finally {
      if (generation.current === currentGeneration) { busy.current = false; setPending(false); }
    }
  }
  function send(text: string, override?: ChatContext, detail?: AskAiDetail) {
    const content = text.trim();
    if (!content || busy.current) return;
    if (override) activeContext.current = override;
    const ctx = detail ? makeMessageContext(detail, override ?? requestContext, deals) : undefined;
    const history: ChatMessage[] = [...messages, { role: "user", content, ...(ctx ? { ctx } : {}) }];
    setMessages(history);
    void request(history, override ?? activeContext.current ?? requestContext);
  }
  useEffect(() => {
    if (!queuedQuestion || pending || busy.current) return;
    const eventPage = queuedQuestion.page;
    const eventDeal = eventPage.match(/^\/(?:deals|portfolio)\/(\d+)(?:\/|$)/);
    const eventCompany = eventPage.match(/^\/companies\/(\d+)(?:\/|$)/);
    send(queuedQuestion.question, { page: eventPage, deal_id: queuedQuestion.deal_id ?? (!queuedQuestion.company_id && !queuedQuestion.pool && eventDeal ? Number(eventDeal[1]) : undefined), company_id: queuedQuestion.company_id ?? (!queuedQuestion.deal_id && !queuedQuestion.pool && eventCompany ? Number(eventCompany[1]) : undefined), pool: queuedQuestion.pool, block: queuedQuestion.block, filters: queuedQuestion.filters }, queuedQuestion);
    onQuestionConsumed?.();
  }, [queuedQuestion, pending]);
  function clear() { generation.current += 1; busy.current = false; activeContext.current = null; setPending(false); setError(null); setErrorThoughtSeconds(null); setMessages([]); }
  function updateAction(updated: AgentAction) {
    setAction(updated);
    setMessages((current) => current.map((message) => message.action?.id === updated.id ? { ...message, action: updated } : message));
  }
  // Высота по тексту (без обрезки), одинаковая ширина колонок, умеренное скругление.
  const chips = (items: string[]) => <div className="stagger grid w-full grid-cols-2 gap-2">{items.map((item) => <button key={item} type="button" disabled={pending} onClick={() => send(item)} className="flex min-h-11 w-full min-w-0 items-center justify-start rounded-[14px] bg-accent px-3 py-2 text-left text-sm leading-snug text-accent-foreground disabled:opacity-50"><span className="break-words">{item}</span></button>)}</div>;
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-background", className)}>
      <div className="flex shrink-0 items-center gap-3 px-4 py-4"><span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="font-semibold">ИИ-помощник</h2><p className="text-xs text-muted-foreground">на основе данных биржи</p></div><button type="button" onClick={clear} aria-label="Новый чат" title="Новый чат" className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"><RotateCcw className="size-5" /></button></div>
      <StickToBottom className="relative min-h-0 flex-1" resize="smooth" initial="instant">
        <StickToBottom.Content className="space-y-4 px-4 py-4" scrollClassName="edge-fade-y h-full" aria-live="polite">
          {messages.length === 0 && <><ChatBubble role="assistant">Здравствуйте! Я помогу разобраться в сделках и ваших инвестициях. Что вас интересует?</ChatBubble><div className="ml-10">{chips(questions)}</div></>}
          {messages.map((message, index) => <div key={index} className="rise space-y-2">{message.role === "user" && message.ctx && <ContextPill ctx={message.ctx} deals={deals} />}{message.role === "assistant" && message.thoughtSeconds !== undefined && <Thinking working={false} elapsed={message.thoughtSeconds} />}<ChatBubble role={message.role}>{message.role === "assistant" ? <RichText text={message.content} /> : message.content}</ChatBubble>{message.role === "assistant" && <div className="ml-10 space-y-2">{message.chart && <AnswerChart chart={message.chart} />}{message.calc && deals[message.calc.deal_id] && <div className="-ml-10"><Calculator deal={deals[message.calc.deal_id]!} initialAmount={message.calc.amount ?? undefined} inChat /></div>}{message.action && <div className="rounded-[24px] border border-accent bg-card p-4"><div className="flex items-center gap-2 font-semibold"><Zap className="size-5 text-accent-foreground" />{message.action.title}</div><p className="mt-2 text-lg font-semibold tabular">{money(message.action.amount)}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{message.action.reason}</p><button type="button" onClick={() => setAction(message.action!)} className="mt-3 min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground">Посмотреть действие</button></div>}{message.deal_ids?.map((id) => deals[id] ? <DealChip key={id} deal={deals[id]!} onClick={onDealClick} /> : null)}{!!message.suggestions?.length && chips(message.suggestions)}</div>}</div>)}
          {pending && <><Thinking working /><AnswerSkeleton /></>}
          {error && <>{errorThoughtSeconds !== null && <Thinking working={false} elapsed={errorThoughtSeconds} />}<ChatBubble role="assistant"><span className="text-destructive">{error}</span><br /><button type="button" onClick={() => void request(messages, activeContext.current ?? requestContext)} className="mt-2 min-h-11 rounded-full bg-secondary px-4 text-sm font-medium text-foreground">Повторить</button></ChatBubble></>}
        </StickToBottom.Content>
        <ScrollDown />
        <ChatEdges />
      </StickToBottom>
      <ChatComposer pending={pending} onSend={send} />
      {action && <AgentActionSheet action={action} open={!!action} onOpenChange={(open) => { if (!open) setAction(null); }} onDone={updateAction} />}
    </div>
  );
}
