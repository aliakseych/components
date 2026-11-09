// In-memory stand-in for the API in server/, started from getConfig().sample (src/sample/data.ts).
// Response shapes follow server/api/views.py and agent.py; derived numbers follow services.py.
import { getConfig } from "@/template.config";
import type { SampleData, SampleDeal } from "@/sample/data";
import type {
  AgentAction, AiChart, AiMessage, AiReply, Company, DealCategory, DealDetail, DealSummary,
  Investor, MyInvestment, Profile,
} from "./types";
import { ApiError } from "./api";

type State = SampleData & { nextId: number };
let state: State | null = null;

function db(): State {
  if (!state) state = { ...structuredClone(getConfig().sample), nextId: 1000 };
  return state;
}

// ---- helpers --------------------------------------------------------------------------------

const DAY = 86_400_000;
const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const addDays = (date: string, days: number) => new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10);
const q2 = (x: number) => Math.round(x * 100) / 100;
const m = (x: number) => q2(x).toFixed(2);
const n = (x: string | null | undefined) => Number(x ?? 0);
const sumText = (x: number) => Math.trunc(x).toLocaleString("ru-RU").replace(/ /g, " ");
const mln = (x: number) => `${String(q2(x / 1e6)).replace(".", ",")}млн`;
const fail = (message: string, status = 400): never => {
  throw new ApiError(status, message);
};

function signedIn(): State["investor"] {
  const s = db();
  if (!s.signedIn) fail("Не авторизован", 401);
  return s.investor;
}

const investorOrNull = () => (db().signedIn ? db().investor : null);

function getDeal(id: number) {
  return db().deals.find((d) => d.id === id) ?? fail("Сделка не найдена", 404);
}

function getCompany(id: number) {
  return db().companies.find((c) => c.id === id) ?? fail("Компания не найдена", 404);
}

const myInvestment = (deal: SampleDeal) =>
  investorOrNull() ? db().investments.find((i) => i.deal_id === deal.id) ?? null : null;

// services.personal_schedule
function personalSchedule(deal: SampleDeal, amount: number): MyInvestment {
  const share = amount / n(deal.investors_amount);
  const schedule = deal.installments.map((i) => ({
    number: i.number, day: i.day, due_date: i.due_date,
    amount: m(n(i.investors_payout) * share), income: m(n(i.investors_income) * share), paid_at: i.paid_at,
  }));
  const paid = schedule.filter((r) => r.paid_at);
  const unpaid = schedule.filter((r) => !r.paid_at);
  const total = (rows: typeof schedule, key: "amount" | "income") => m(rows.reduce((s, r) => s + n(r[key]), 0));
  return {
    amount: m(amount),
    share_pct: q2(share * 100),
    schedule,
    expected_total: m(amount + schedule.reduce((s, r) => s + n(r.income), 0)),
    received_total: total(paid, "amount"),
    income_expected: total(unpaid, "income"),
    income_received: total(paid, "income"),
    next_payout: unpaid[0] ? { due_date: unpaid[0].due_date, amount: unpaid[0].amount } : null,
  };
}

function dealSummary(d: SampleDeal): DealSummary {
  const company = getCompany(d.business_id);
  const inv = myInvestment(d);
  const next = d.installments.find((i) => !i.paid_at);
  return {
    id: d.id, title: d.title, commodity: d.commodity, category: d.category, ticker: d.ticker,
    items_count: d.items.length,
    sparkline: d.price_history.slice(-12).map((p) => Math.trunc(p[1])),
    price_change_pct: q2Pct(d),
    quantity: d.quantity, unit: d.unit,
    business: { id: company.id, name: company.name, kind: company.kind, region: company.region, rating: company.rating, halal: company.halal },
    investor_rate: d.investor_rate, term_days: d.term_days, status: d.status,
    investors_amount: d.investors_amount, collected_amount: d.collected_amount,
    collected_pct: Math.trunc(Math.min(100, (n(d.collected_amount) * 100) / n(d.investors_amount))),
    investors_count: d.investors_count + (db().investments.some((i) => i.deal_id === d.id) ? 1 : 0),
    min_investment: d.min_investment,
    collect_deadline: d.collect_deadline,
    days_left: d.collect_deadline ? Math.round((Date.parse(d.collect_deadline) - Date.parse(today())) / DAY) : null,
    started_at: d.started_at,
    next_due: next?.due_date ?? null,
    my_investment: inv?.amount ?? null,
  };
}

const q2Pct = (d: SampleDeal) => Math.round((n(d.current_price) / n(d.exchange_price) - 1) * 1000) / 10;

function businessJson(c: State["companies"][number]) {
  return {
    id: c.id, name: c.name, kind: c.kind, region: c.region, rating: c.rating,
    uzex_since: c.uzex_since, uzex_deals: c.uzex_deals, uzex_paid_pct: c.uzex_paid_pct,
    repayment_source: c.repayment_source, halal: c.halal, inn: c.inn, halal_note: c.halal_note,
  };
}

function dealDetail(d: SampleDeal): DealDetail {
  const inv = myInvestment(d);
  const change = q2Pct(d);
  const { business_id: _b, investors_count: _c, created_at: _t, ...fields } = d;
  return {
    ...dealSummary(d),
    ...fields,
    price_change_pct: change,
    margin_left_pct: Math.round((n(d.loss_threshold_pct) + change) * 10) / 10,
    business: businessJson(getCompany(d.business_id)),
    my_investment: inv ? personalSchedule(d, n(inv.amount)) : null,
  };
}

// views.company_stability
function stability(c: State["companies"][number]): Company["stability"] {
  const years = Math.max(0, new Date().getFullYear() - c.uzex_since);
  const capital = n(c.charter_capital);
  const concentrated = c.founders.some((f) => f.share_pct > 90);
  const paid = n(c.uzex_paid_pct);
  const courts = c.court_cases ?? 0;
  const checks: [string, boolean, string, number][] = [
    [`На бирже ${years}лет`, years >= 2, "Опыт работы на бирже", 10],
    [`Оплаты в срок ${String(paid).replace(".", ",")}%`, paid >= 95, "Доля своевременных оплат", 15],
    [`Сделок на бирже ${c.uzex_deals}`, c.uzex_deals >= 50, "История сделок", 10],
    [`Уставный капитал ${String(capital / 1e6).replace(".", ",")}млн`, capital >= 100_000_000, "Размер капитала", 10],
    ["Долги по налогам", !c.tax_debt, c.tax_debt ? "Есть долги" : "Нет долгов", 15],
    ["Суды", courts === 0, `Дел: ${courts}`, 15],
    ["Учредители", !concentrated, concentrated ? "Доля одного учредителя выше 90%" : "Нет высокой концентрации", 10],
    ["Имущество в залоге", !c.pledged_assets, c.pledged_assets ? "Есть залог" : "Нет залога", 15],
  ];
  const score = 100 - checks.reduce((s, [, ok, , penalty]) => s + (ok ? 0 : penalty), 0);
  return {
    score,
    level: score >= 80 ? "good" : score >= 60 ? "ok" : "risk",
    factors: checks.map(([label, ok, text]) => ({ label, ok, text })),
  };
}

function me(): Investor {
  const s = db();
  const investor = signedIn();
  let invested = 0, expected = 0, received = 0;
  let next: Investor["next_payout"] = null;
  for (const inv of s.investments) {
    const deal = getDeal(inv.deal_id);
    const p = personalSchedule(deal, n(inv.amount));
    expected += n(p.income_expected);
    received += n(p.income_received);
    if (deal.status !== "completed") invested += n(inv.amount) - (n(p.received_total) - n(p.income_received));
    const due = p.next_payout?.due_date;
    if (deal.status === "active" && p.next_payout && due && (!next || due < (next.due_date ?? ""))) {
      next = { ...p.next_payout, deal_id: deal.id, deal_title: deal.title };
    }
  }
  return {
    id: investor.id, name: investor.name, phone: investor.phone, balance: investor.balance,
    invested: m(invested), income_expected: m(expected), income_received: m(received),
    next_payout: next, profile: investor.profile,
  };
}

function parseAmount(body: Record<string, unknown>) {
  const amount = Number(body.amount);
  if (body.amount === null || body.amount === undefined || body.amount === "" || !Number.isFinite(amount)) fail("Введите сумму");
  return amount;
}

function addOperation(kind: "topup" | "invest" | "payout", amount: number, deal?: SampleDeal) {
  const s = db();
  s.operations.unshift({ id: s.nextId++, kind, amount: m(amount), deal_id: deal?.id ?? null, deal_title: deal?.title ?? null, created_at: nowIso() });
}

function topup(amount: number) {
  const investor = signedIn();
  if (amount <= 0) fail("Введите сумму");
  investor.balance = m(n(investor.balance) + amount);
  addOperation("topup", amount);
}

// services.invest
function invest(deal: SampleDeal, amount: number) {
  const s = db();
  const investor = signedIn();
  if (deal.status !== "collecting") fail("Сбор по этой сделке завершён");
  if (amount < n(deal.min_investment)) fail(`Минимальное вложение — ${sumText(n(deal.min_investment))} сум`);
  if (amount > n(investor.balance)) fail("Недостаточно средств на счёте");
  const remaining = n(deal.investors_amount) - n(deal.collected_amount);
  if (amount > remaining + 0.001) fail(`Осталось собрать ${sumText(remaining)} сум`);
  investor.balance = m(n(investor.balance) - amount);
  const inv = s.investments.find((i) => i.deal_id === deal.id);
  if (inv) inv.amount = m(n(inv.amount) + amount);
  else s.investments.push({ deal_id: deal.id, amount: m(amount) });
  deal.collected_amount = m(n(deal.collected_amount) + amount);
  addOperation("invest", -amount, deal);
  if (n(deal.collected_amount) >= n(deal.investors_amount)) {
    deal.status = "active";
    deal.started_at = today();
    for (const i of deal.installments) i.due_date = addDays(deal.started_at, i.day);
  }
}

// ---- lists ----------------------------------------------------------------------------------

const STATUS_ORDER = { collecting: 0, active: 1, completed: 2 } as const;

function dealList(params: URLSearchParams) {
  let deals = [...db().deals];
  const q = (params.get("q") ?? "").trim().toLowerCase();
  if (q) {
    deals = deals.filter((d) => {
      const c = getCompany(d.business_id);
      return [d.title, d.commodity, d.ticker, c.name, c.region, d.warehouse_region, ...d.items.map((i) => i.commodity)]
        .join(" ").toLowerCase().includes(q);
    });
  }
  let status = params.get("status");
  if (status === "open") status = "collecting";
  if (status === "closed") deals = deals.filter((d) => d.status !== "collecting");
  else if (status) deals = deals.filter((d) => d.status === status);
  const categories = params.getAll("category").flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
  if (categories.length) deals = deals.filter((d) => categories.includes(d.category));
  const number = (key: string) => {
    const value = params.get(key);
    if (value === null) return null;
    const parsed = Number(value);
    if (value === "" || !Number.isFinite(parsed)) fail("Неверный фильтр");
    return parsed;
  };
  const minRate = number("min_rate");
  if (minRate !== null) deals = deals.filter((d) => n(d.investor_rate) >= minRate);
  const maxMin = number("max_min_investment");
  if (maxMin !== null) deals = deals.filter((d) => n(d.min_investment) <= maxMin);
  const maxDays = number("max_days_left");
  if (maxDays !== null) {
    const deadline = addDays(today(), Math.trunc(maxDays));
    deals = deals.filter((d) => d.collect_deadline !== null && d.collect_deadline <= deadline);
  }
  const summaries = deals.map(dealSummary);
  const by = <T,>(key: (d: DealSummary) => T, desc = false) => (a: DealSummary, b: DealSummary) => {
    const x = key(a), y = key(b);
    return x === y ? a.id - b.id : (x < y ? -1 : 1) * (desc ? -1 : 1);
  };
  const created = (d: DealSummary) => getDeal(d.id).created_at;
  const sort = params.get("sort");
  if (sort === "rate") summaries.sort(by((d) => n(d.investor_rate), true));
  else if (sort === "collected") summaries.sort(by((d) => d.collected_pct, true));
  else if (sort === "deadline") summaries.sort(by((d) => d.collect_deadline ?? "9999"));
  else if (sort === "new") summaries.sort(by(created, true));
  else if (sort === "amount") summaries.sort(by((d) => n(d.investors_amount), true));
  else summaries.sort(by((d) => STATUS_ORDER[d.status]));
  return { items: summaries, count: summaries.length };
}

function pools() {
  const s = db();
  const items = s.pools.flatMap(({ key, title, subtitle }) => {
    const deals = s.deals.filter((d) => d.category === key);
    if (!deals.length) return [];
    const collecting = deals.filter((d) => d.status === "collecting");
    const histories = deals.map((d) => d.price_history.slice(-12).map((p) => p[1])).filter((h) => h[0])
      .map((h) => h.map((p) => (p * 100) / h[0]));
    const length = Math.max(0, ...histories.map((h) => h.length));
    const sparkline = Array.from({ length }, (_, i) => {
      const index = i - length;
      const values = histories.filter((h) => h.length >= -index).map((h) => h[h.length + index]);
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    });
    return [{
      key, title, subtitle, deals_count: deals.length, collecting_count: collecting.length,
      rate_max: m(Math.max(...deals.map((d) => n(d.investor_rate)))),
      target_total: m(collecting.reduce((t, d) => t + n(d.investors_amount), 0)),
      collected_total: m(collecting.reduce((t, d) => t + n(d.collected_amount), 0)),
      sparkline,
    }];
  });
  return { items };
}

function stats() {
  const s = db();
  const funded = s.deals.filter((d) => d.status !== "collecting");
  const withDeals = s.companies.filter((c) => s.deals.some((d) => d.business_id === c.id));
  return {
    ...s.stats,
    tons_financed: m(funded.reduce((t, d) => t + n(d.quantity), 0)),
    deals_count: s.deals.length,
    businesses_count: withDeals.length,
    regions_count: new Set(withDeals.map((c) => c.region)).size,
  };
}

function portfolio() {
  signedIn();
  const s = db();
  const items = s.investments
    .map((inv) => ({ inv, deal: getDeal(inv.deal_id) }))
    .sort((a, b) => STATUS_ORDER[a.deal.status] - STATUS_ORDER[b.deal.status] || a.deal.id - b.deal.id)
    .map(({ inv, deal }) => ({ ...dealSummary(deal), ...personalSchedule(deal, n(inv.amount)) }));
  return { items };
}

function companyPage(id: number) {
  const c = getCompany(id);
  const deals = db().deals.filter((d) => d.business_id === id).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const paid = deals.flatMap((d) => d.installments.filter((i) => i.paid_at));
  const onTime = paid.filter((i) => i.due_date && i.paid_at! <= i.due_date).length;
  const { tax_debt: _t, court_cases: _c, pledged_assets: _p, ...company } = c;
  return {
    ...company,
    orginfo_url: "#",
    orginfo_direct: false,
    stability: stability(c),
    deals: deals.map(dealSummary),
    totals: {
      deals: deals.length,
      raised: m(deals.filter((d) => d.status !== "collecting").reduce((t, d) => t + n(d.investors_amount), 0)),
      paid_on_time_pct: paid.length ? q2((onTime * 100) / paid.length) : 100,
    },
  };
}

// ---- agent ----------------------------------------------------------------------------------

function createAction(input: { kind: "invest" | "topup"; deal_id: number | null; amount: number; title: string; reason: string; source?: string }): AgentAction {
  const s = db();
  const deal = input.deal_id ? getDeal(input.deal_id) : null;
  const action: AgentAction = {
    id: s.nextId++, source: input.source ?? "Помощник", kind: input.kind, deal_id: deal?.id ?? null,
    deal_title: deal?.title ?? null, amount: m(input.amount), title: input.title, reason: input.reason,
    status: "pending", result: "", created_at: nowIso(), executed_at: null,
  };
  s.agentActions.unshift(action);
  return action;
}

function runAction(id: number, kind: string) {
  signedIn();
  const action = db().agentActions.find((a) => a.id === id) ?? fail("Действие не найдено", 404);
  if (action.status !== "pending") fail("Действие уже обработано");
  if (kind === "reject") {
    action.status = "rejected";
    action.result = "Отклонено";
  } else {
    try {
      if (action.kind === "topup") topup(n(action.amount));
      else invest(getDeal(action.deal_id ?? 0), n(action.amount));
      action.status = "executed";
      action.result = action.kind === "topup" ? `Баланс пополнен на ${sumText(n(action.amount))} сум` : `Вложено ${sumText(n(action.amount))} сум`;
    } catch (e) {
      action.status = "failed";
      action.result = e instanceof Error ? e.message : "Ошибка";
    }
  }
  action.executed_at = nowIso();
  return action;
}

// ---- AI chat --------------------------------------------------------------------------------
// Keyword-based demo replies. The real assistant (LLM prompts, context, validation) lives in
// server/api/ai.py; this only imitates its answer shape so the template works offline.

const CATEGORY_LABEL: Record<DealCategory, string> = { fuel: "Топливо", agro: "Агро", food: "Продукты", construction: "Стройка" };

function bestDeals(profile: Profile | null, limit = 3) {
  const open = db().deals.filter((d) => d.status === "collecting");
  const wanted = profile?.categories.length ? open.filter((d) => profile.categories.includes(d.category)) : [];
  const pool = wanted.length ? wanted : open;
  return [...pool].sort((a, b) => n(b.investor_rate) - n(a.investor_rate)).slice(0, limit);
}

function findDeal(text: string, context: Record<string, unknown>) {
  const s = db();
  const byNumber = text.match(/(?:сделк[а-яё]*|№|#)\s*(\d+)/i);
  if (byNumber) return s.deals.find((d) => d.id === Number(byNumber[1])) ?? null;
  const byTicker = s.deals.find((d) => text.toUpperCase().includes(d.ticker));
  if (byTicker) return byTicker;
  return typeof context.deal_id === "number" ? s.deals.find((d) => d.id === context.deal_id) ?? null : null;
}

function amountIn(text: string): number | null {
  const match = text.replace(/\s(?=\d{3}\b)/g, "").match(/(\d+(?:[.,]\d+)?)\s*(млн|миллион\w*|тыс\w*|k|m)?/i);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  const unit = (match[2] ?? "").toLowerCase();
  if (unit.startsWith("млн") || unit.startsWith("миллион") || unit === "m") return value * 1e6;
  if (unit.startsWith("тыс") || unit === "k") return value * 1e3;
  return value < 1000 ? value * 1e6 : value;
}

function reply(text: string, extra: Partial<AiReply> = {}): AiReply {
  return { reply: text, suggestions: ["Покажи мой портфель", "Лучшие сделки сейчас", "Когда выплаты?"], deal_ids: [], chart: null, action: null, calc: null, ...extra };
}

function chat(body: Record<string, unknown>): AiReply {
  const messages = body.messages as AiMessage[] | undefined;
  const context = (body.context ?? {}) as Record<string, unknown>;
  const last = Array.isArray(messages) ? messages[messages.length - 1] : undefined;
  if (!last || last.role !== "user" || !last.content?.trim()) fail("Пустое сообщение");
  const text = last!.content.toLowerCase();
  const investor = investorOrNull();
  const deal = findDeal(last!.content, context);

  if (context.mode === "onboarding") {
    const picks = bestDeals(investor?.profile ?? null);
    if (/подбер|сделк|профил/.test(text) && picks.length) {
      return reply(
        `Под ваш профиль подходят:\n\n${picks.map((d) => `- **${d.title}** — ${n(d.investor_rate).toString().replace(".", ",")}% годовых, ${CATEGORY_LABEL[d.category].toLowerCase()}, от ${mln(n(d.min_investment))}`).join("\n")}\n\nЭто не банковский вклад: доход зависит от того, как компания платит по графику.`,
        { deal_ids: picks.map((d) => d.id), suggestions: ["Чем они отличаются?", "Как работают выплаты?"] },
      );
    }
    return reply("Стратегию можно поменять в любой момент в профиле. Ответьте на вопросы выше — подберу сделки под ваши цели.", {
      suggestions: ["Что выбрать новичку?", "Какой риск у сделок?"],
    });
  }

  if (/влож|инвест|купи/.test(text) && amountIn(text) && deal) {
    const amount = amountIn(text)!;
    const action = createAction({
      kind: "invest", deal_id: deal.id, amount, title: `Вложить ${mln(amount)} в «${deal.title}»`,
      reason: `Ставка ${deal.investor_rate.replace(".", ",")}% годовых, срок ${deal.term_days} дней.`,
    });
    return reply(`Подготовил вложение ${mln(amount)} в «${deal.title}». Подтвердите действие — без вашего подтверждения деньги не спишутся.`, {
      action, deal_ids: [deal.id], suggestions: ["Сколько я получу?", "Какие риски?", "Покажи другие сделки"],
    });
  }

  if (/пополн/.test(text) && amountIn(text)) {
    const amount = amountIn(text)!;
    const action = createAction({ kind: "topup", deal_id: null, amount, title: `Пополнить баланс на ${mln(amount)}`, reason: "По вашей просьбе в чате." });
    return reply(`Подготовил пополнение на ${mln(amount)}. Подтвердите действие.`, { action, suggestions: ["Лучшие сделки сейчас", "Покажи мой портфель"] });
  }

  if (/сколько|доход|заработ|посчита|калькул/.test(text)) {
    const target = deal ?? bestDeals(investor?.profile ?? null, 1)[0];
    if (target) {
      const amount = amountIn(text) ?? 5_000_000;
      const income = (amount * n(target.investor_rate) / 100) * target.term_days / 365;
      return reply(`С ${mln(amount)} в «${target.title}» за ${target.term_days} дней получится около ${mln(income)} дохода.`, {
        calc: { deal_id: target.id, amount }, deal_ids: [target.id], suggestions: ["Вложить в эту сделку", "Когда выплаты?", "Какие риски?"],
      });
    }
  }

  if (/выплат|график|когда/.test(text)) {
    if (!investor) return reply("Войдите, чтобы увидеть график выплат.", { suggestions: ["Лучшие сделки сейчас", "Как это работает?"] });
    const rows = db().investments.flatMap((inv) => {
      const d = getDeal(inv.deal_id);
      return personalSchedule(d, n(inv.amount)).schedule.filter((r) => !r.paid_at && r.due_date).map((r) => ({ ...r, deal: d }));
    }).sort((a, b) => a.due_date!.localeCompare(b.due_date!)).slice(0, 8);
    if (!rows.length) return reply("Предстоящих выплат пока нет: вложите в сделку на сборе, и график появится после старта выкупа.", { deal_ids: bestDeals(investor.profile, 2).map((d) => d.id) });
    const chart: AiChart = {
      type: "line", title: "Предстоящие выплаты", unit: "сум",
      data: rows.map((r) => ({ label: new Date(r.due_date!).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), value: Math.round(n(r.amount)) })),
    };
    return reply(`Ближайшая выплата — ${mln(n(rows[0].amount))} по сделке «${rows[0].deal.title}».\n\nВсего впереди ${rows.length} выплат.`, {
      chart, suggestions: ["Покажи мой портфель", "Куда вложить ещё?", "Сколько я заработаю?"],
    });
  }

  if (/портфел|мои|баланс|вложен/.test(text)) {
    if (!investor) return reply("Войдите, чтобы увидеть портфель.", { suggestions: ["Лучшие сделки сейчас", "Как это работает?"] });
    const totals = new Map<string, number>();
    for (const inv of db().investments) {
      const d = getDeal(inv.deal_id);
      if (d.status === "completed") continue;
      totals.set(CATEGORY_LABEL[d.category], (totals.get(CATEGORY_LABEL[d.category]) ?? 0) + n(inv.amount));
    }
    const summary = me();
    const chart: AiChart = { type: "pie", title: "Портфель по категориям", unit: "сум", data: [...totals].map(([label, value]) => ({ label, value })) };
    return reply(`В сделках ${mln(n(summary.invested))}, на балансе ${mln(n(summary.balance))}.\n\nОжидаемый доход — ${mln(n(summary.income_expected))}, уже получено ${mln(n(summary.income_received))}.`, {
      chart, suggestions: ["Когда выплаты?", "Куда вложить свободные деньги?", "Как снизить риск?"],
    });
  }

  if (/лучш|подбер|куда|выгодн|сделк|ставк/.test(text)) {
    const picks = bestDeals(investor?.profile ?? null);
    const chart: AiChart = { type: "bar", title: "Ставка, % годовых", unit: "%", data: picks.map((d) => ({ label: d.ticker, value: n(d.investor_rate) })) };
    return reply(`Сейчас на сборе:\n\n${picks.map((d) => `- **${d.title}** — ${d.investor_rate.replace(".", ",")}%, собрано ${dealSummary(d).collected_pct}%`).join("\n")}`, {
      deal_ids: picks.map((d) => d.id), chart, suggestions: ["Сравни риски", `Посчитай доход с 5млн`, "Вложить 2млн в сделку " + (picks[0]?.id ?? 1)],
    });
  }

  if (deal && /риск|надёжн|надежн|компани/.test(text)) {
    const c = getCompany(deal.business_id);
    return reply(`«${c.name}»: на бирже с ${c.uzex_since} года, ${c.uzex_deals} сделок, ${c.uzex_paid_pct.replace(".", ",")}% оплачены в срок.\n\nЗапас по цене — ${deal.loss_threshold_pct.replace(".", ",")}%, худшее падение за историю — ${deal.worst_drop_pct.replace(".", ",")}%.`, {
      deal_ids: [deal.id], suggestions: ["Сколько я получу?", "Вложить 1млн", "Покажи другие сделки"],
    });
  }

  return reply("Я помогаю с вложениями: покажу портфель, подберу сделки, посчитаю доход и график выплат.", {
    suggestions: ["Покажи мой портфель", "Лучшие сделки сейчас", "Посчитай доход с 5млн"],
  });
}

// ---- router ---------------------------------------------------------------------------------

export function mockRequest(method: string, path: string, rawBody: unknown): unknown {
  const s = db();
  const url = new URL(path, "http://mock");
  const p = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  const body = (rawBody && typeof rawBody === "object" ? rawBody : {}) as Record<string, unknown>;
  const match = (pattern: RegExp) => p.match(pattern);
  let r: RegExpMatchArray | null;

  if (method === "GET") {
    if (p === "/me/") return me();
    if (p === "/profile/") return signedIn().profile;
    if (p === "/stats/") return stats();
    if (p === "/pools/") return pools();
    if ((r = match(/^\/pools\/(\w+)\/$/))) return pools().items.find((pool) => pool.key === r![1]) ?? fail("Пул не найден", 404);
    if (p === "/deals/") return dealList(url.searchParams);
    if ((r = match(/^\/deals\/(\d+)\/$/))) return dealDetail(getDeal(Number(r[1])));
    if ((r = match(/^\/companies\/(\d+)\/$/))) return companyPage(Number(r[1]));
    if (p === "/portfolio/") return portfolio();
    if (p === "/operations/") return signedIn() && { items: s.operations };
    if (p === "/agent/actions/") {
      signedIn();
      const status = url.searchParams.get("status");
      return { items: s.agentActions.filter((a) => !status || a.status === status) };
    }
    if (p === "/agent/tokens/") return signedIn() && { items: s.agentTokens };
    if (p === "/ai/insights/") return signedIn() && { items: s.insights };
    if ((r = match(/^\/ai\/deal\/(\d+)\/$/))) {
      const deal = getDeal(Number(r[1]));
      return s.dealAi[deal.id] ?? {
        summary: `«${deal.title}»: ставка ${deal.investor_rate.replace(".", ",")}% годовых на ${deal.term_days} дней, выплаты каждые 15 дней.`,
        pros: [`Запас по цене ${deal.loss_threshold_pct.replace(".", ",")}%`, "Товар хранится на складе"],
        risks: ["Цена товара может снизиться", "Это не банковский вклад"],
        fit: investorOrNull()?.profile.onboarded ? "ok" : null,
        fit_text: investorOrNull()?.profile.onboarded ? "Подходит под умеренный риск." : null,
      };
    }
  }

  if (method === "POST") {
    if (p === "/auth/login/") {
      const phone = String(body.phone ?? "").replace(/\D/g, "");
      if (phone !== s.credentials.phone || body.password !== s.credentials.password) fail("Неверный телефон или пароль");
      s.signedIn = true;
      return me();
    }
    if (p === "/auth/register/") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const phone = String(body.phone ?? "").replace(/\D/g, "");
      if (!name || name.length > 100) fail("Введите имя");
      if (phone.length < 9 || phone.length > 12) fail("Неверный телефон");
      if (typeof body.password !== "string" || body.password.length < 6) fail("Пароль от 6 символов");
      if (phone === s.credentials.phone) fail("Телефон уже зарегистрирован");
      s.credentials = { phone, password: body.password as string };
      s.investor = {
        id: s.nextId++, name, phone, balance: "0.00",
        profile: { onboarded: false, strategy: null, risk_level: null, horizon_days: null, monthly_amount: null, categories: [] },
      };
      s.investments = [];
      s.operations = [];
      s.agentActions = [];
      s.agentTokens = [];
      s.insights = [];
      s.signedIn = true;
      return me();
    }
    if (p === "/auth/logout/") {
      s.signedIn = false;
      return { status: "ok" };
    }
    if (p === "/profile/") {
      const profile = signedIn().profile;
      const allowed = ["onboarded", "strategy", "risk_level", "horizon_days", "monthly_amount", "categories"];
      if (Object.keys(body).some((k) => !allowed.includes(k))) fail("Неверные данные");
      if ("onboarded" in body) profile.onboarded = body.onboarded === true;
      if ("strategy" in body) profile.strategy = (body.strategy as Profile["strategy"]) ?? null;
      if ("risk_level" in body) profile.risk_level = (body.risk_level as Profile["risk_level"]) ?? null;
      if ("horizon_days" in body) profile.horizon_days = (body.horizon_days as number | null) ?? null;
      if ("monthly_amount" in body) profile.monthly_amount = body.monthly_amount == null ? null : m(Number(body.monthly_amount));
      if ("categories" in body) {
        if (!Array.isArray(body.categories) || body.categories.some((c) => !(c in CATEGORY_LABEL))) fail("Неверные данные");
        profile.categories = body.categories as DealCategory[];
      }
      return profile;
    }
    if ((r = match(/^\/deals\/(\d+)\/invest\/$/))) {
      signedIn();
      const deal = getDeal(Number(r[1]));
      invest(deal, parseAmount(body));
      return dealDetail(deal);
    }
    if (p === "/account/topup/") {
      topup(parseAmount(body));
      return me();
    }
    if ((r = match(/^\/agent\/actions\/(\d+)\/(execute|reject)\/$/))) return runAction(Number(r[1]), r[2]);
    if (p === "/agent/tokens/") {
      signedIn();
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 100) fail("Введите название токена");
      const token = { id: s.nextId++, name, created_at: nowIso(), last_used_at: null };
      s.agentTokens.unshift(token);
      const secret = `demo_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")}`;
      return { ...token, token: secret };
    }
    if ((r = match(/^\/agent\/tokens\/(\d+)\/revoke\/$/))) {
      signedIn();
      const index = s.agentTokens.findIndex((t) => t.id === Number(r![1]));
      if (index < 0) fail("Токен не найден", 404);
      s.agentTokens.splice(index, 1);
      return { status: "ok" };
    }
    if (p === "/ai/chat/") return chat(body);
  }

  if (method === "DELETE" && (r = match(/^\/agent\/tokens\/(\d+)\/$/))) {
    return mockRequest("POST", `/agent/tokens/${r[1]}/revoke/`, undefined);
  }

  throw new ApiError(404, `No mock for ${method} ${path}`);
}
