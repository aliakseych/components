// Neutral, clearly fictional sample data the mock API starts from. Replace with your own.
// Companies, people and INNs are invented. Dates are computed from Date.now(), so the demo never
// looks stale. server/api/management/commands/seed.py seeds the same data into the real API.
import type {
  AgentAction, AgentToken, AiInsight, Company, DealAi, DealCategory, DealItem, DealStatus,
  Installment, Investor, Operation, Profile, Stats,
} from "@/lib/types";

/** A deal as stored by the mock: DealDetail without the per-request fields. */
export interface SampleDeal {
  id: number;
  title: string;
  commodity: string;
  category: DealCategory;
  quantity: string;
  unit: string;
  business_id: number;
  ticker: string;
  investor_rate: string;
  term_days: number;
  status: DealStatus;
  investors_amount: string;
  collected_amount: string;
  /** Other (fictional) investors already in the deal, not counting the demo user. */
  investors_count: number;
  min_investment: string;
  collect_deadline: string | null;
  started_at: string | null;
  created_at: string;
  request_text: string;
  warehouse: string;
  warehouse_region: string;
  exchange_price: string;
  goods_amount: string;
  exchange_fee: string;
  down_payment_pct: string;
  down_payment: string;
  bank_amount: string;
  markup: string;
  business_total: string;
  business_rate: string;
  loss_threshold_pct: string;
  bank_threshold_pct: string;
  worst_drop_pct: string;
  current_price: string;
  price_history: [string, number][];
  agent_checks: string[];
  installments: Installment[];
  items: DealItem[];
}

export interface SampleData {
  /** Whether the demo starts signed in. */
  signedIn: boolean;
  /** Demo login used by the login form and the "demo account" button. */
  credentials: { phone: string; password: string };
  investor: Pick<Investor, "id" | "name" | "phone" | "balance"> & { profile: Profile };
  /** Stability score and registry link are derived by the mock, as in server/api/views.py. */
  companies: (Omit<Company, "stability" | "orginfo_url" | "orginfo_direct"> &
    { tax_debt?: boolean; court_cases?: number; pledged_assets?: boolean })[];
  deals: SampleDeal[];
  /** The demo investor's investments: deal id and amount. */
  investments: { deal_id: number; amount: string }[];
  operations: Operation[];
  pools: { key: DealCategory; title: string; subtitle: string }[];
  stats: Stats;
  agentActions: AgentAction[];
  agentTokens: AgentToken[];
  insights: AiInsight[];
  dealAi: Record<number, DealAi>;
}

// ---- dates and money ----------------------------------------------------------------------

const DAY = 86_400_000;
const now = Date.now();
const day = (offset: number) => new Date(now + offset * DAY).toISOString().slice(0, 10);
const at = (offset: number, hour = 12) => {
  const d = new Date(now + offset * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const q2 = (x: number) => Math.round(x * 100) / 100;
const m = (x: number) => q2(x).toFixed(2);

// Same formulas as server/api/services.py (deal_numbers, build_installments).
const RATIOS = [0.2, 0.3, 0.2, 0.3];
const DAYS = [15, 30, 45, 60];

interface DealSeed {
  id: number;
  title: string;
  business_id: number;
  ticker: string;
  category: DealCategory;
  items: { commodity: string; quantity: number; unit?: string; price: number; warehouse: string; warehouse_region: string }[];
  rate: number;
  dp: number;
  drift: number; // current price vs exchange price, %
  worst: number;
  status: DealStatus;
  collected?: number; // share collected for "collecting"
  deadline?: number; // days until collect deadline
  started?: number; // days ago the buyout started
  paid?: number; // installments paid
  investors: number;
  request: string;
  checks: string[];
}

function priceHistory(price: number, drift: number, seed: number): [string, number][] {
  const points: [string, number][] = [];
  for (let i = 23; i >= 0; i--) {
    const wave = Math.sin((23 - i) * 0.65 + seed) * 0.025 + Math.cos((23 - i) * 0.31 + seed * 2) * 0.015;
    const trend = (drift / 100) * ((23 - i) / 23);
    points.push([day(-i * 7), Math.round(price * (1 + wave * (i / 23) + trend))]);
  }
  return points;
}

function buildDeal(s: DealSeed): SampleDeal {
  const quantity = s.items.reduce((sum, item) => sum + item.quantity, 0);
  const goods = q2(s.items.reduce((sum, item) => sum + q2(item.quantity * item.price), 0));
  const fee = q2(goods * 0.0018);
  const down = q2(((goods + fee) * s.dp) / 100);
  const pool = goods + fee - down;
  const investors = q2(pool * 0.85);
  const markup = q2(pool * 0.0239);
  const businessTotal = goods + fee + markup;
  const exchangePrice = q2(goods / quantity);
  const started = s.started === undefined ? null : day(-s.started);

  const payable = businessTotal - down;
  let outstanding = investors;
  let toInvestors = 0;
  const installments: Installment[] = [];
  RATIOS.forEach((ratio, index) => {
    const last = index === 3;
    const payment = last ? q2(payable - installments.reduce((sum, r) => sum + Number(r.business_payment), 0)) : q2(payable * ratio);
    const income = q2((outstanding * s.rate) / 100 * 15 / 365);
    const principal = last ? outstanding : Math.min(outstanding, payment - income);
    const bank = last ? q2(payable - toInvestors - principal - income) : 0;
    toInvestors += principal + income;
    outstanding = q2(outstanding - principal);
    const due = s.started === undefined ? null : day(-s.started + DAYS[index]);
    installments.push({
      number: index + 1,
      day: DAYS[index],
      due_date: due,
      business_payment: m(payment),
      quantity_released: m(quantity * ratio),
      investors_payout: m(principal + income),
      investors_income: m(income),
      bank_payout: m(bank),
      paid_at: index < (s.paid ?? 0) ? due : null,
    });
  });

  const first = s.items[0];
  return {
    id: s.id,
    title: s.title,
    commodity: first.commodity,
    category: s.category,
    quantity: m(quantity),
    unit: first.unit ?? "т",
    business_id: s.business_id,
    ticker: s.ticker,
    investor_rate: m(s.rate),
    term_days: 60,
    status: s.status,
    investors_amount: m(investors),
    collected_amount: m(s.status === "collecting" ? q2(investors * (s.collected ?? 0)) : investors),
    investors_count: s.investors,
    min_investment: m(1_000_000),
    collect_deadline: s.status === "collecting" ? day(s.deadline ?? 7) : started,
    started_at: started,
    created_at: at(s.status === "collecting" ? -(10 - (s.deadline ?? 7)) : -(s.started ?? 0) - 10),
    request_text: s.request,
    warehouse: first.warehouse,
    warehouse_region: first.warehouse_region,
    exchange_price: m(exchangePrice),
    goods_amount: m(goods),
    exchange_fee: m(fee),
    down_payment_pct: m(s.dp),
    down_payment: m(down),
    bank_amount: m(pool - investors),
    markup: m(markup),
    business_total: m(businessTotal),
    business_rate: m(22.27),
    loss_threshold_pct: m(s.dp + (15 * (100 - s.dp)) / 100 - 0.2),
    bank_threshold_pct: m(s.dp - 0.2),
    worst_drop_pct: m(s.worst),
    current_price: m(exchangePrice * (1 + s.drift / 100)),
    price_history: priceHistory(exchangePrice, s.drift, s.id),
    agent_checks: s.checks,
    installments,
    items: s.items.map((item) => ({
      commodity: item.commodity,
      quantity: m(item.quantity),
      unit: item.unit ?? "т",
      price: m(item.price),
      amount: m(item.quantity * item.price),
      warehouse: item.warehouse,
      warehouse_region: item.warehouse_region,
    })),
  };
}

// ---- companies ------------------------------------------------------------------------------

const year = new Date(now).getFullYear();

const companies: SampleData["companies"] = [
  {
    id: 1, name: "Северный агро", kind: "агропереработчик", region: "Северная область", rating: "A",
    uzex_since: year - 5, uzex_deals: 140, uzex_paid_pct: "98.80",
    repayment_source: "Продажи масла и шрота: выписки банка за 6 месяцев",
    legal_name: "ООО «Северный агро»", legal_form: "ООО", inn: "300000001", director: "Иванова Мария Сергеевна",
    registered_at: "2014-04-02", charter_capital: "900000000.00", employees: 120,
    activity: "Переработка масличных культур", address: "Северная область, г. Примерный, ул. Полевая, 12",
    founders: [{ name: "Иванова Мария Сергеевна", share_pct: 60 }, { name: "Петров Олег Николаевич", share_pct: 40 }],
    halal: true, halal_note: "",
  },
  {
    id: 2, name: "Вектор Топливо", kind: "сеть АЗС", region: "Приозёрная область", rating: "A",
    uzex_since: year - 4, uzex_deals: 118, uzex_paid_pct: "98.40",
    repayment_source: "Розничная выручка 14 АЗС: выписки банка за 6 месяцев",
    legal_name: "ООО «Вектор Топливо»", legal_form: "ООО", inn: "300000002", director: "Смирнов Андрей Викторович",
    registered_at: "2015-09-18", charter_capital: "1200000000.00", employees: 85,
    activity: "Розничная торговля топливом", address: "Приозёрная область, г. Озёрный, пр. Энергетиков, 3",
    founders: [{ name: "Смирнов Андрей Викторович", share_pct: 100 }],
    halal: true, halal_note: "",
  },
  {
    id: 3, name: "Пекарня Рассвет", kind: "хлебокомбинат", region: "Южная область", rating: "A",
    uzex_since: year - 6, uzex_deals: 260, uzex_paid_pct: "99.20",
    repayment_source: "Выручка 40 пекарен и договоры с магазинами",
    legal_name: "ООО «Пекарня Рассвет»", legal_form: "ООО", inn: "300000003", director: "Кузнецова Елена Павловна",
    registered_at: "2012-02-27", charter_capital: "650000000.00", employees: 210,
    activity: "Производство хлеба и выпечки", address: "Южная область, г. Солнечный, ул. Хлебная, 7",
    founders: [{ name: "Кузнецова Елена Павловна", share_pct: 55 }, { name: "Орлов Денис Игоревич", share_pct: 45 }],
    halal: true, halal_note: "",
  },
  {
    id: 4, name: "Сладкий берег", kind: "кондитерская фабрика", region: "Восточная область", rating: "B",
    uzex_since: year - 2, uzex_deals: 30, uzex_paid_pct: "100.00",
    repayment_source: "Договоры с торговыми сетями, счета-фактуры за 3 месяца",
    legal_name: "ООО «Сладкий берег»", legal_form: "ООО", inn: "300000004", director: "Волков Игорь Андреевич",
    registered_at: "2019-06-11", charter_capital: "300000000.00", employees: 64,
    activity: "Производство кондитерских изделий", address: "Восточная область, г. Речной, ул. Набережная, 21",
    founders: [{ name: "Волков Игорь Андреевич", share_pct: 70 }, { name: "Волкова Анна Олеговна", share_pct: 30 }],
    halal: true, halal_note: "",
  },
  {
    id: 5, name: "Каменный мост", kind: "строительная компания", region: "Центральный округ", rating: "B",
    uzex_since: year - 1, uzex_deals: 14, uzex_paid_pct: "91.50",
    repayment_source: "Договор подряда с застройщиком, акт выполненных работ",
    legal_name: "ООО «Каменный мост»", legal_form: "ООО", inn: "300000005", director: "Соколов Павел Дмитриевич",
    registered_at: "2022-10-05", charter_capital: "50000000.00", employees: 26,
    activity: "Строительство зданий", address: "Центральный округ, г. Примерный, ул. Строителей, 40",
    founders: [{ name: "Соколов Павел Дмитриевич", share_pct: 95 }, { name: "Лебедев Артём Сергеевич", share_pct: 5 }],
    halal: false, halal_note: "Финансируется процентным кредитом банка",
    court_cases: 2,
  },
  {
    id: 6, name: "Транзит-Логистик", kind: "автотранспортное предприятие", region: "Западная область", rating: "A",
    uzex_since: year - 3, uzex_deals: 62, uzex_paid_pct: "100.00",
    repayment_source: "Договоры перевозок с оплатой по графику",
    legal_name: "ООО «Транзит-Логистик»", legal_form: "ООО", inn: "300000006", director: "Морозов Кирилл Антонович",
    registered_at: "2017-03-22", charter_capital: "400000000.00", employees: 140,
    activity: "Грузовые автоперевозки", address: "Западная область, г. Дорожный, ул. Транспортная, 9",
    founders: [{ name: "Морозов Кирилл Антонович", share_pct: 50 }, { name: "Зайцев Роман Ильич", share_pct: 50 }],
    halal: true, halal_note: "",
  },
];

// ---- deals ----------------------------------------------------------------------------------

const seeds: DealSeed[] = [
  {
    id: 1, title: "60т АИ-92 для сети АЗС", business_id: 2, ticker: "AI92", category: "fuel",
    items: [{ commodity: "Бензин АИ-92", quantity: 60, price: 13_500_000, warehouse: "Нефтебаза «Озёрная»", warehouse_region: "Приозёрная область" }],
    rate: 19.97, dp: 30, drift: -1.1, worst: 34.2, status: "collecting", collected: 0.62, deadline: 3, investors: 37,
    request: "Нужно 60т АИ-92 на два месяца, забирать четырьмя партиями",
    checks: [
      "Лоты на 6 нефтебазах, выбрана ближайшая к АЗС",
      "Цена — средняя по сделкам за последнюю неделю",
      "Выручка АЗС покрывает каждый платёж графика",
      "Взнос 30%: запас по цене 40,3%, худшее падение за 3 года — 34,2%",
    ],
  },
  {
    id: 2, title: "100т семян подсолнечника для маслозавода", business_id: 1, ticker: "SUNF", category: "agro",
    items: [{ commodity: "Семена подсолнечника, 1 класс", quantity: 100, price: 4_580_000, warehouse: "Элеватор «Северный»", warehouse_region: "Северная область" }],
    rate: 19.5, dp: 30, drift: -3.9, worst: 26.5, status: "collecting", collected: 0.35, deadline: 6, investors: 9,
    request: "100т семян 1 класса на 60 дней, забираем партиями по 20–30т",
    checks: [
      "47 сделок за неделю, средняя цена 4 580 000 сум/т",
      "Источник погашения — продажи масла и шрота",
      "Сезон сбора: взнос 30% вместо 20%",
      "Худшие 60 дней в котировках — минус 26,5%",
    ],
  },
  {
    id: 3, title: "30т муки 1 сорта для хлебокомбината", business_id: 3, ticker: "FLR1", category: "food",
    items: [{ commodity: "Мука пшеничная 1 сорта", quantity: 30, price: 4_300_000, warehouse: "Мельница «Колос»", warehouse_region: "Южная область" }],
    rate: 18.5, dp: 20, drift: 0.8, worst: 12.4, status: "collecting", collected: 0.18, deadline: 9, investors: 4,
    request: "30т муки на 60 дней для 40 пекарен",
    checks: [
      "Мука — товар с низкой волатильностью: худшее падение 12,4%",
      "260 сделок на бирже, 99,2% оплачены в срок",
      "Выручка пекарен покрывает график с запасом",
    ],
  },
  {
    id: 4, title: "200т цемента и 15т арматуры для стройки", business_id: 5, ticker: "CMNT", category: "construction",
    items: [
      { commodity: "Портландцемент М400", quantity: 200, price: 700_000, warehouse: "Склад «Цемтранс»", warehouse_region: "Центральный округ" },
      { commodity: "Арматура А500С, 12мм", quantity: 15, price: 8_450_000, warehouse: "Металлобаза «Прокат»", warehouse_region: "Центральный округ" },
    ],
    rate: 21.0, dp: 30, drift: 1.6, worst: 18.0, status: "collecting", collected: 0.8, deadline: 4, investors: 7,
    request: "Цемент и арматура под договор подряда, поставка в два этапа",
    checks: [
      "Два товара в корзине: цена — средневзвешенная за тонну",
      "Компания на бирже 1 год: 14 сделок, 91,5% оплат в срок",
      "Два судебных дела в реестре — ставка выше на 1%",
    ],
  },
  {
    id: 5, title: "25т сахара для кондитерской фабрики", business_id: 4, ticker: "SUGR", category: "food",
    items: [{ commodity: "Сахар-песок", quantity: 25, price: 11_900_000, warehouse: "Склад «Восточный»", warehouse_region: "Восточная область" }],
    rate: 19.0, dp: 25, drift: 2.3, worst: 15.6, status: "collecting", collected: 0.92, deadline: 2, investors: 14,
    request: "25т сахара на 60 дней под заказы торговых сетей",
    checks: [
      "Договоры с 3 торговыми сетями на 4 месяца вперёд",
      "100% оплат в срок по 30 сделкам",
      "Запас по цене 36,1% при худшем падении 15,6%",
    ],
  },
  {
    id: 6, title: "20т дизтоплива для автопарка", business_id: 6, ticker: "DSL1", category: "fuel",
    items: [{ commodity: "Дизельное топливо Евро-5", quantity: 20, price: 12_800_000, warehouse: "Нефтебаза «Западная»", warehouse_region: "Западная область" }],
    rate: 19.97, dp: 30, drift: 1.2, worst: 30.1, status: "active", started: 25, paid: 1, investors: 15,
    request: "20т дизтоплива для 60 грузовиков на два месяца",
    checks: ["Договоры перевозок покрывают график", "62 сделки, 100% оплат в срок"],
  },
  {
    id: 7, title: "80т хлопкового шрота для фермы", business_id: 1, ticker: "MEAL", category: "agro",
    items: [{ commodity: "Шрот хлопковый", quantity: 80, price: 2_900_000, warehouse: "Элеватор «Северный»", warehouse_region: "Северная область" }],
    rate: 19.0, dp: 30, drift: -2.0, worst: 22.0, status: "active", started: 38, paid: 2, investors: 11,
    request: "80т шрота на корма, забираем партиями",
    checks: ["Стабильный спрос на корма", "140 сделок на бирже"],
  },
  {
    id: 8, title: "120т цемента для жилого комплекса", business_id: 5, ticker: "CM40", category: "construction",
    items: [{ commodity: "Портландцемент М400", quantity: 120, price: 720_000, warehouse: "Склад «Цемтранс»", warehouse_region: "Центральный округ" }],
    rate: 21.0, dp: 30, drift: 0.5, worst: 18.0, status: "active", started: 12, paid: 0, investors: 6,
    request: "120т цемента под второй этап строительства",
    checks: ["Акт выполненных работ подтверждён", "Ставка выше из-за короткой истории"],
  },
  {
    id: 9, title: "35т муки высшего сорта", business_id: 3, ticker: "FLRH", category: "food",
    items: [{ commodity: "Мука пшеничная высшего сорта", quantity: 35, price: 4_800_000, warehouse: "Мельница «Колос»", warehouse_region: "Южная область" }],
    rate: 18.5, dp: 20, drift: 1.9, worst: 12.4, status: "completed", started: 95, paid: 4, investors: 10,
    request: "35т муки высшего сорта для кондитерского цеха",
    checks: ["Все 4 платежа получены в срок"],
  },
  {
    id: 10, title: "40т АИ-95 для сети АЗС", business_id: 2, ticker: "AI95", category: "fuel",
    items: [{ commodity: "Бензин АИ-95", quantity: 40, price: 14_200_000, warehouse: "Нефтебаза «Озёрная»", warehouse_region: "Приозёрная область" }],
    rate: 19.97, dp: 30, drift: 2.8, worst: 34.2, status: "completed", started: 120, paid: 4, investors: 22,
    request: "40т АИ-95 на два месяца",
    checks: ["Выплачено полностью, без просрочек"],
  },
];

const deals = seeds.map(buildDeal);

// ---- the demo investor's money --------------------------------------------------------------

const investments = [
  { deal_id: 6, amount: "5000000.00" },
  { deal_id: 7, amount: "3000000.00" },
  { deal_id: 9, amount: "3000000.00" },
  { deal_id: 1, amount: "2000000.00" },
];

const operations: Operation[] = [];
let opId = 1;
let balance = 0;
const op = (kind: Operation["kind"], amount: number, offset: number, deal?: SampleDeal) => {
  balance = q2(balance + amount);
  operations.push({ id: opId++, kind, amount: m(amount), deal_id: deal?.id ?? null, deal_title: deal?.title ?? null, created_at: at(offset) });
};
op("topup", 32_000_000, -180);
for (const inv of investments) {
  const deal = deals.find((d) => d.id === inv.deal_id)!;
  const start = deal.started_at ? -Math.round((now - Date.parse(deal.started_at)) / DAY) : -2;
  op("invest", -Number(inv.amount), start, deal);
  const share = Number(inv.amount) / Number(deal.investors_amount);
  for (const i of deal.installments) {
    if (i.paid_at) op("payout", q2(Number(i.investors_payout) * share), start + i.day, deal);
  }
}
operations.sort((a, b) => b.created_at.localeCompare(a.created_at));

// ---- AI and agents --------------------------------------------------------------------------

const agentActions: AgentAction[] = [
  {
    id: 1, source: "Помощник", kind: "invest", deal_id: 5, deal_title: deals[4].title, amount: "2000000.00",
    title: "Вложить 2млн в «25т сахара»", reason: "Сбор почти закрыт, компания платит в срок 100% сделок.",
    status: "pending", result: "", created_at: at(-0, 9), executed_at: null,
  },
  {
    id: 2, source: "Мой агент", kind: "topup", deal_id: null, deal_title: null, amount: "5000000.00",
    title: "Пополнить баланс на 5млн", reason: "Ежемесячное пополнение по плану профиля.",
    status: "pending", result: "", created_at: at(-1, 18), executed_at: null,
  },
  {
    id: 3, source: "Мой агент", kind: "invest", deal_id: 1, deal_title: deals[0].title, amount: "2000000.00",
    title: "Вложить 2млн в «60т АИ-92»", reason: "Топливо — в интересах профиля.",
    status: "executed", result: "Вложено 2 000 000 сум", created_at: at(-2, 10), executed_at: at(-2, 11),
  },
];

const agentTokens: AgentToken[] = [
  { id: 1, name: "Мой агент", created_at: at(-20), last_used_at: at(-1, 18) },
];

const insights: AiInsight[] = [
  { title: "Ближайшая выплата", text: "Через несколько дней придёт выплата по сделке «20т дизтоплива для автопарка».", tone: "good", deal_id: 6 },
  { title: "Деньги лежат без дела", text: "На балансе больше 20млн. Сделка «25т сахара» закрывается через 2 дня.", tone: "info", deal_id: 5 },
  { title: "Много вложено в одну категорию", text: "Больше половины портфеля — топливо. Распределение по категориям снижает риск.", tone: "warn", deal_id: null },
];

const dealAi: Record<number, DealAi> = {
  1: {
    summary: "Надёжная сеть АЗС и короткий срок: сбор почти закрыт, выплаты каждые 15 дней.",
    pros: ["98,4% оплат в срок", "Выручка АЗС покрывает график", "Запас по цене 40,3%"],
    risks: ["Цена топлива колеблется", "Это не банковский вклад"],
    fit: "good", fit_text: "Топливо есть в ваших интересах, срок 60 дней совпадает с горизонтом.",
  },
  4: {
    summary: "Ставка выше рынка, но у компании короткая история и судебные дела.",
    pros: ["Ставка 21% годовых", "Сбор закрыт на 80%"],
    risks: ["Всего 14 сделок на бирже", "Два судебных дела", "91,5% оплат в срок"],
    fit: "poor", fit_text: "Для умеренного риска сделка рискованнее, чем нужно.",
  },
};

export const sampleData: SampleData = {
  signedIn: true,
  credentials: { phone: "998901234567", password: "demo1234" },
  investor: {
    id: 1,
    name: "Анна Демо",
    phone: "998901234567",
    balance: m(balance),
    profile: {
      onboarded: true, strategy: "balanced", risk_level: "medium", horizon_days: 60,
      monthly_amount: "5000000.00", categories: ["fuel", "food"],
    },
  },
  companies,
  deals,
  investments,
  operations,
  pools: [
    { key: "fuel", title: "Топливо", subtitle: "АЗС и автопарки" },
    { key: "agro", title: "Агро", subtitle: "Маслозаводы и фермы" },
    { key: "food", title: "Продукты", subtitle: "Хлебозаводы и кондитеры" },
    { key: "construction", title: "Стройка", subtitle: "Цемент и арматура" },
  ],
  stats: { tons_financed: "0", deals_count: 0, businesses_count: 0, regions_count: 0, investors_count: 1240, on_time_pct: 99 },
  agentActions,
  agentTokens,
  insights,
  dealAi,
};
