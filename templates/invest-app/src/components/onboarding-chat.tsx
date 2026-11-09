"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, Coins, Rocket, Scale, Send, Shield, Sparkles } from "lucide-react";
import { ChatBubble, ChatTyping, RichText } from "@/components/ai/chat-bubble";
import { api, ApiError } from "@/lib/api";
import { useScrollEdges } from "@/lib/motion";
import { AnswerSkeleton } from "@/components/ai/ai-skeletons";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, mln, pct } from "@/lib/format";
import type { AiMessage, AiReply, DealCategory, DealSummary, Investor, RiskLevel, Strategy } from "@/lib/types";

type Answers = {
  strategy: Strategy | null;
  risk_level: RiskLevel | null;
  horizon_days: number | null;
  monthly_amount: number | null;
  categories: DealCategory[];
};

const strategies = [
  { value: "conservative" as const, label: "Спокойно", hint: "Бережный подход", icon: Shield },
  { value: "balanced" as const, label: "Баланс", hint: "Доход и осторожность", icon: Scale },
  { value: "growth" as const, label: "Максимум дохода", hint: "Больше возможностей", icon: Rocket },
];
const risks = [
  { value: "low" as const, label: "Не хочу терять", hint: "Низкий риск" },
  { value: "medium" as const, label: "Готов к небольшому", hint: "Умеренный риск" },
  { value: "high" as const, label: "Риск — нормально", hint: "Высокий риск" },
];
const horizons = [
  { value: 60, label: "2 мес", hint: "Короткий срок" },
  { value: 180, label: "полгода", hint: "Средний срок" },
  { value: 365, label: "год и больше", hint: "Длинный срок" },
];
const categories = Object.keys(CATEGORY_LABEL) as DealCategory[];
const questions = ["Какая у вас цель?", "Как относитесь к риску?", "На какой срок планируете вложить?", "Сколько планируете вкладывать в месяц?", "Какие товары вам интересны? Можно выбрать несколько."];

function typingDelay() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600));
}

export function OnboardingChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({ strategy: null, risk_level: null, horizon_days: null, monthly_amount: null, categories: [] });
  const [typing, setTyping] = useState(true);
  // True while waiting on /ai/chat/: show an answer skeleton instead of the typing dots.
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [saved, setSaved] = useState(false);
  const scrollEdges = useScrollEdges();
  const end = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    async function start() {
      let name = "";
      try {
        const me = await api<Investor>("/me/");
        name = me.name.trim().split(/\s+/)[0];
      } catch {
        setError("Не удалось загрузить имя");
      }
      await typingDelay();
      setMessages([{ role: "assistant", content: `Привет${name ? `, ${name}` : ""}! Подберём, куда вложить. 4 вопроса.\n\n${questions[0]}` }]);
      setStep(0);
      setTyping(false);
    }
    void start();
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, step, deals, error]);

  async function advance(label: string, next: Answers) {
    setAnswers(next);
    setMessages((items) => [...items, { role: "user", content: label }]);
    setError("");
    setTyping(true);
    setBusy(true);
    await typingDelay();
    const nextStep = step + 1;
    if (nextStep < questions.length) {
      setMessages((items) => [...items, { role: "assistant", content: questions[nextStep] }]);
      setStep(nextStep);
      setTyping(false);
      setBusy(false);
      return;
    }
    const summary = `Ваш профиль:\n\n- **Цель:** ${strategies.find((item) => item.value === next.strategy)?.label}\n- **Риск:** ${risks.find((item) => item.value === next.risk_level)?.label}\n- **Срок:** ${horizons.find((item) => item.value === next.horizon_days)?.label}\n- **В месяц:** ${mln(next.monthly_amount ?? 0)}\n- **Интересы:** ${next.categories.map((category) => CATEGORY_LABEL[category]).join(", ") || "Любые товары"}`;
    setMessages((items) => [...items, { role: "assistant", content: summary }]);
    setStep(5);
    setTyping(false);
    await saveProfile(next);
  }

  async function saveProfile(profile: Answers) {
    setBusy(true);
    setError("");
    try {
      await api("/profile/", { method: "POST", body: JSON.stringify({ ...profile, onboarded: true }) });
      setSaved(true);
      setTyping(true);
      setThinking(true);
      const request: AiMessage = { role: "user", content: "Подбери мне сделки под мой профиль" };
      try {
        const [result] = await Promise.all([
          api<AiReply>("/ai/chat/", { method: "POST", body: JSON.stringify({ messages: [request], context: { mode: "onboarding" } }) }),
          typingDelay(),
        ]);
        setMessages((items) => [...items, request, { role: "assistant", content: result.reply }]);
        const found = await Promise.all(result.deal_ids.map((id) => api<DealSummary>(`/deals/${id}/`).catch(() => null)));
        setDeals(found.filter((deal): deal is DealSummary => deal !== null));
      } catch {
        setError("ИИ сейчас недоступен. Можно перейти к сделкам.");
      } finally {
        setTyping(false);
        setThinking(false);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить профиль");
    } finally {
      setBusy(false);
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || typing) return;
    const conversation: AiMessage[] = [...messages, { role: "user", content: text }];
    setMessages(conversation);
    setInput("");
    setError("");
    setBusy(true);
    setTyping(true);
    setThinking(true);
    try {
      const [result] = await Promise.all([
        api<AiReply>("/ai/chat/", { method: "POST", body: JSON.stringify({ messages: conversation.slice(-20), context: { mode: "onboarding" } }) }),
        typingDelay(),
      ]);
      setMessages((items) => [...items, { role: "assistant", content: result.reply }]);
    } catch {
      setError("ИИ сейчас недоступен. Продолжим настройку.");
    } finally {
      setTyping(false);
      setThinking(false);
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    setError("");
    try {
      await api("/profile/", { method: "POST", body: JSON.stringify({ onboarded: true }) });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить профиль");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-background">
      <header className="flex min-h-16 shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-2 font-semibold"><span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-5" /></span> Ваш помощник</div>
        <button type="button" onClick={skip} disabled={busy} className="min-h-11 px-2 text-sm text-muted-foreground disabled:opacity-50">Пропустить</button>
      </header>
      <div ref={scrollEdges} className="edge-fade-y min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((message, index) => <div key={index} className="rise"><ChatBubble role={message.role}><RichText text={message.content} /></ChatBubble></div>)}
        {typing && (thinking ? <AnswerSkeleton chart={false} /> : <ChatTyping />)}
        {!typing && step === 0 && <div className="stagger space-y-2 pl-10">{strategies.map(({ value, label, hint, icon: Icon }) => <button type="button" key={value} disabled={busy} onClick={() => void advance(label, { ...answers, strategy: value })} className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-card p-3 text-left"><span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><Icon className="size-5" /></span><span><span className="block font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span></button>)}</div>}
        {!typing && step === 1 && <div className="stagger space-y-2 pl-10">{risks.map(({ value, label, hint }, index) => <button type="button" key={value} disabled={busy} onClick={() => void advance(label, { ...answers, risk_level: value })} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-card p-3 text-left"><span><span className="block font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span><span className="flex gap-1" aria-hidden>{[0, 1, 2].map((segment) => <span key={segment} className={`h-2 w-5 rounded-full ${segment <= index ? "bg-primary" : "bg-muted"}`} />)}</span></button>)}</div>}
        {!typing && step === 2 && <div className="stagger space-y-2 pl-10">{horizons.map(({ value, label, hint }) => <button type="button" key={value} disabled={busy} onClick={() => void advance(label, { ...answers, horizon_days: value })} className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-card p-3 text-left"><CalendarDays className="size-5 text-accent-foreground" /><span><span className="block font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span></button>)}</div>}
        {!typing && step === 3 && <div className="stagger flex flex-wrap gap-2 pl-10">{[1, 5, 10, 25].map((amount) => <button type="button" key={amount} disabled={busy} onClick={() => void advance(`${amount}млн`, { ...answers, monthly_amount: amount * 1_000_000 })} className="flex min-h-12 items-center gap-2 rounded-full bg-card px-4 font-semibold"><Coins className="size-4 text-accent-foreground" />{amount}млн</button>)}</div>}
        {!typing && step === 4 && <div className="space-y-3 pl-10"><div className="flex flex-wrap gap-2">{categories.map((category) => { const Icon = CATEGORY_ICON[category]; const selected = answers.categories.includes(category); const tone = CATEGORY_TONE[category]; return <button type="button" key={category} aria-pressed={selected} disabled={busy} onClick={() => setAnswers({ ...answers, categories: selected ? answers.categories.filter((item) => item !== category) : [...answers.categories, category] })} className={`flex min-h-12 items-center gap-2 rounded-full px-4 font-medium ${selected ? `${tone.bg} ${tone.fg}` : "bg-card"}`}><Icon className="size-4" />{CATEGORY_LABEL[category]}{selected && <Check className="size-4" />}</button>; })}</div><button type="button" disabled={busy} onClick={() => void advance(answers.categories.map((category) => CATEGORY_LABEL[category]).join(", ") || "Любые товары", answers)} className="min-h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground">Готово</button></div>}
        {deals.map((deal) => <Link key={deal.id} href={`/deals/${deal.id}`} className="ml-10 flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 font-medium"><span>{deal.title}</span><span className="shrink-0 tabular text-gain">{pct(deal.investor_rate, 2)}</span></Link>)}
        {error && <p role="alert" className="pl-10 text-sm text-destructive">{error}</p>}
        {step === 5 && !busy && !saved && <button type="button" onClick={() => void saveProfile(answers)} className="ml-10 min-h-12 rounded-full bg-primary px-5 text-primary-foreground">Повторить сохранение</button>}
        {step === 5 && saved && !busy && <button type="button" onClick={() => { router.push("/"); router.refresh(); }} className="min-h-14 w-full rounded-full bg-primary px-5 font-semibold text-primary-foreground">Перейти к сделкам</button>}
        <div ref={end} />
      </div>
      <form onSubmit={ask} className="flex shrink-0 items-center gap-2 bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Спросите что угодно…" aria-label="Спросите что угодно" className="min-h-12 min-w-0 flex-1 rounded-full bg-card px-4 outline-none" />
        <button type="submit" aria-label="Отправить" disabled={!input.trim() || busy || typing} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"><Send className="size-5" /></button>
      </form>
    </div>
  );
}
