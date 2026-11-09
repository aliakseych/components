export type DealStatus = "collecting" | "active" | "completed";
export type DealCategory = "fuel" | "agro" | "food" | "construction";

export interface NextPayout {
  due_date: string | null;
  amount: string;
}

export interface Investor {
  id: number;
  name: string;
  phone: string;
  balance: string;
  invested: string;
  income_expected: string;
  income_received: string;
  next_payout: (NextPayout & { deal_id: number; deal_title: string }) | null;
  profile: Profile;
}

export type Strategy = "conservative" | "balanced" | "growth";
export type RiskLevel = "low" | "medium" | "high";

export interface Profile {
  onboarded: boolean;
  strategy: Strategy | null;
  risk_level: RiskLevel | null;
  horizon_days: number | null;
  monthly_amount: string | null;
  categories: DealCategory[];
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

// Ответ ИИ-чата. deal_ids — сделки, которые стоит показать карточками под ответом.
export interface AiReply {
  reply: string;
  suggestions: string[];
  deal_ids: number[];
  chart?: AiChart | null;
  action?: AgentAction | null;
  // Калькулятор дохода по сделке прямо в чате; amount — стартовая сумма.
  calc?: { deal_id: number; amount: number | null } | null;
}

// График, который ИИ может приложить к ответу.
export interface AiChart {
  type: "bar" | "line" | "area" | "pie";
  title: string;
  unit: string;
  data: { label: string; value: number }[];
}

// Действие, предложенное ИИ (своим помощником или внешним агентом через MCP).
export interface AgentAction {
  id: number;
  source: string;
  kind: "invest" | "topup";
  deal_id: number | null;
  deal_title: string | null;
  amount: string;
  title: string;
  reason: string;
  status: "pending" | "executed" | "rejected" | "failed";
  result: string;
  created_at: string;
  executed_at: string | null;
}

export interface AgentToken {
  id: number;
  name: string;
  created_at: string;
  last_used_at: string | null;
  token?: string; // только в ответе на создание
}

export interface Founder {
  name: string;
  share_pct: number;
}

export interface StabilityFactor {
  label: string;
  ok: boolean;
  text: string;
}

export interface Company {
  id: number;
  name: string;
  kind: string;
  region: string;
  rating: string;
  uzex_since: number;
  uzex_deals: number;
  uzex_paid_pct: string;
  repayment_source: string;
  legal_name: string;
  legal_form: string;
  inn: string;
  director: string;
  registered_at: string | null;
  charter_capital: string | null;
  employees: number | null;
  activity: string;
  address: string;
  founders: Founder[];
  halal: boolean;
  halal_note: string;
  orginfo_url: string;
  orginfo_direct: boolean;
  stability: { score: number; level: "good" | "ok" | "risk"; factors: StabilityFactor[] };
}

export interface CompanyPage extends Company {
  deals: DealSummary[];
  totals: { deals: number; raised: string; paid_on_time_pct: number };
}

export interface AiInsight {
  title: string;
  text: string;
  tone: "good" | "info" | "warn";
  deal_id: number | null;
}

export interface DealAi {
  summary: string;
  pros: string[];
  risks: string[];
  fit: "good" | "ok" | "poor" | null;
  fit_text: string | null;
}

export interface DealSummary {
  id: number;
  title: string;
  commodity: string;
  category: DealCategory;
  quantity: string;
  unit: string;
  business: { id: number; name: string; kind: string; region: string; rating: string; halal: boolean };
  investor_rate: string;
  term_days: number;
  status: DealStatus;
  investors_amount: string;
  collected_amount: string;
  collected_pct: number;
  investors_count: number;
  min_investment: string;
  collect_deadline: string | null;
  days_left: number | null;
  started_at: string | null;
  next_due: string | null;
  my_investment: string | null;
  ticker: string;
  items_count: number;
  sparkline: number[];
  price_change_pct: number;
}

export interface DealItem {
  commodity: string;
  quantity: string;
  unit: string;
  price: string;
  amount: string;
  warehouse: string;
  warehouse_region: string;
}

export interface Pool {
  key: DealCategory;
  title: string;
  subtitle: string;
  deals_count: number;
  collecting_count: number;
  rate_max: string;
  target_total: string;
  collected_total: string;
  sparkline: number[];
}

export interface Installment {
  number: number;
  day: number;
  due_date: string | null;
  business_payment: string;
  quantity_released: string;
  investors_payout: string;
  investors_income: string;
  bank_payout: string;
  paid_at: string | null;
}

export interface PersonalPayout {
  number: number;
  day: number;
  due_date: string | null;
  amount: string;
  income: string;
  paid_at: string | null;
}

export interface MyInvestment {
  amount: string;
  share_pct: number;
  schedule: PersonalPayout[];
  expected_total: string;
  received_total: string;
  income_expected: string;
  income_received: string;
  next_payout: NextPayout | null;
}

export interface Business {
  id: number;
  inn: string;
  halal: boolean;
  name: string;
  kind: string;
  region: string;
  rating: string;
  uzex_since: number;
  uzex_deals: number;
  uzex_paid_pct: string;
  repayment_source: string;
}

export interface DealDetail extends Omit<DealSummary, "business" | "my_investment"> {
  business: Business;
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
  price_change_pct: number;
  margin_left_pct: number;
  price_history: [string, number][];
  agent_checks: string[];
  installments: Installment[];
  items: DealItem[];
  my_investment: MyInvestment | null;
}

export type PortfolioItem = DealSummary & Omit<MyInvestment, "amount"> & { amount: string };

export interface Operation {
  id: number;
  kind: "topup" | "invest" | "payout";
  amount: string;
  deal_id: number | null;
  deal_title: string | null;
  created_at: string;
}

export interface Stats {
  tons_financed: string;
  deals_count: number;
  businesses_count: number;
  regions_count: number;
  investors_count: number;
  on_time_pct: number;
}
