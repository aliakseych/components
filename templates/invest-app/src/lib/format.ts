import { Building2, Fuel, Sprout, Wheat } from "lucide-react";
import type { DealCategory, DealStatus } from "./types";

const int = (n: number) => Math.round(n).toLocaleString("ru-RU");

export function money(v: string | number) {
  return `${int(Number(v))} сум`;
}

export function mln(v: string | number) {
  const n = Number(v);
  if (Math.abs(n) < 1e6) return money(n);
  return `${(n / 1e6).toFixed(2).replace(".", ",").replace(/,00$/, "")}млн`;
}

// Сокращения пишутся слитно («19,97%», «60т», «5млн»), слова — через пробел («3 дн.», «1 000 000 сум»).
export function pct(v: string | number, digits = 1) {
  return `${Number(Number(v).toFixed(digits)).toLocaleString("ru-RU", { maximumFractionDigits: digits })}%`;
}

export function qty(v: string | number, unit = "т") {
  return `${Number(v).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}${unit}`;
}

export function days(n: number) {
  return `${n} дн.`;
}

export function dateShort(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(iso)).replace(".", "");
}

export function dateLong(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(iso))
    .replace(" г.", "");
}

export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const STATUS_LABEL: Record<DealStatus, string> = {
  collecting: "Сбор",
  active: "Выкуп",
  completed: "Завершена",
};

export const STATUS_BADGE: Record<DealStatus, string> = {
  collecting: "bg-blue-50 text-blue-700",
  active: "bg-amber-50 text-amber-700",
  completed: "bg-muted text-muted-foreground",
};

export const CATEGORY_LABEL: Record<DealCategory, string> = {
  fuel: "Топливо",
  agro: "Агро",
  food: "Продукты",
  construction: "Стройка",
};

export const CATEGORY_ICON = { fuel: Fuel, agro: Sprout, food: Wheat, construction: Building2 };

// Цвет пула/категории: фон плитки и цвет графика.
export const CATEGORY_TONE: Record<DealCategory, { bg: string; fg: string; stroke: string }> = {
  fuel: { bg: "bg-[oklch(0.92_0.07_60)]", fg: "text-[oklch(0.45_0.12_50)]", stroke: "stroke-[oklch(0.7_0.15_55)]" },
  agro: { bg: "bg-lime", fg: "text-lime-foreground", stroke: "stroke-gain" },
  food: { bg: "bg-accent", fg: "text-accent-foreground", stroke: "stroke-[oklch(0.6_0.14_300)]" },
  construction: { bg: "bg-[oklch(0.9_0.05_230)]", fg: "text-[oklch(0.42_0.1_240)]", stroke: "stroke-[oklch(0.6_0.12_235)]" },
};
