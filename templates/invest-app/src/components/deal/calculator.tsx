"use client";

import { useState } from "react";
import Link from "next/link";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { GlassCard } from "@/components/viz/glass-card";
import { dateShort, mln, money, pct } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

const presets = [1_000_000, 5_000_000, 10_000_000, 25_000_000];

export function Calculator({ deal, initialAmount, inChat = false }: { deal: DealDetail; initialAmount?: number; inChat?: boolean }) {
  const min = Number(deal.min_investment);
  const max = deal.status === "collecting"
    ? Math.max(min, Number(deal.investors_amount) - Number(deal.collected_amount))
    : Math.max(min, 100_000_000);
  const [input, setInput] = useState(String(Math.min(max, Math.max(min, initialAmount ?? Number(deal.my_investment?.amount ?? 10_000_000)))));
  const amount = Number(input) || 0;
  const share = Number(deal.investors_amount) ? amount / Number(deal.investors_amount) : 0;
  const rows = deal.installments.map((item) => ({
    ...item,
    payout: Number(item.investors_payout) * share,
    income: Number(item.investors_income) * share,
  }));
  const income = rows.reduce((sum, row) => sum + row.income, 0);
  const total = rows.reduce((sum, row) => sum + row.payout, 0);
  const termRate = amount ? income / amount * 100 : 0;
  const depositIncome = amount * 0.1842 * deal.term_days / 365;
  const comparisonMax = Math.max(income, depositIncome, 1);
  const payoutMax = Math.max(1, ...rows.map((row) => row.payout));

  if (inChat) {
    return (
      <GlassCard className="space-y-3 p-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="shrink-0 text-base font-semibold">Калькулятор дохода</h2>
          <span className="min-w-0 truncate text-sm text-muted-foreground">{deal.ticker}</span>
        </div>
        <div className="flex items-baseline justify-center text-2xl font-semibold tabular">
          <input
            aria-label="Сумма вложения, сум"
            inputMode="numeric"
            value={input ? Number(input).toLocaleString("ru-RU") : ""}
            onChange={(event) => setInput(event.target.value.replace(/\D/g, "").slice(0, 12))}
            className="min-w-0 bg-transparent text-right outline-none"
            style={{ width: `${Math.max(1, (input ? Number(input).toLocaleString("ru-RU") : "").length) + 0.6}ch` }}
          />
          <span className="ml-[0.25em]">сум</span>
        </div>
        <input
          aria-label="Сумма вложения"
          type="range"
          min={min}
          max={max}
          step={1_000_000}
          value={Math.min(max, Math.max(min, amount))}
          onChange={(event) => setInput(event.target.value)}
          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-lime/60 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-lime"
        />
        <div className="grid grid-cols-4 gap-1.5">
          {presets.map((value) => (
            <button key={value} type="button" onClick={() => setInput(String(value))} className={`h-9 rounded-full text-xs font-semibold ${amount === value ? "bg-lime text-lime-foreground" : "bg-secondary"}`}>
              {mln(value)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-sm text-muted-foreground">Вернётся</p><p className="whitespace-nowrap text-base font-semibold tabular">{mln(total)}</p></div>
          <div><p className="text-sm text-muted-foreground">Доход</p><p className="whitespace-nowrap text-base font-semibold tabular text-gain">+{mln(income)}</p></div>
        </div>
        <p className="text-xs text-muted-foreground tabular">+{pct(termRate, 2)} за {deal.term_days} дней</p>
        <Link href={`/deals/${deal.id}`} className="flex h-11 w-full items-center justify-center rounded-full bg-secondary text-sm font-semibold">Открыть сделку</Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-5 p-5">
      <h2 className="text-lg font-semibold">Калькулятор дохода</h2>
      <div className="flex items-baseline justify-center text-3xl font-semibold tabular">
        <input
          aria-label="Сумма вложения, сум"
          inputMode="numeric"
          value={input ? Number(input).toLocaleString("ru-RU") : ""}
          onChange={(event) => setInput(event.target.value.replace(/\D/g, "").slice(0, 12))}
          className="min-w-0 max-w-[75%] bg-transparent text-right outline-none"
          style={{ width: `${Math.max(1, (input ? Number(input).toLocaleString("ru-RU") : "").length) + 0.6}ch` }}
        />
        <span className="ml-[0.25em]">сум</span>
      </div>
      <input
        aria-label="Сумма вложения"
        type="range"
        min={min}
        max={max}
        step={1_000_000}
        value={Math.min(max, Math.max(min, amount))}
        onChange={(event) => setInput(event.target.value)}
        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-lime/60 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-lime"
      />
      <div className="flex flex-wrap justify-center gap-2">
        {presets.map((value) => (
          <button key={value} type="button" onClick={() => setInput(String(value))} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${amount === value ? "bg-lime text-lime-foreground" : "bg-secondary"}`}>
            {mln(value)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-sm text-muted-foreground">Вернётся</p><p className="break-words text-lg font-semibold tabular">{money(total)}</p></div>
        <div><p className="text-sm text-muted-foreground">Доход</p><p className="break-words text-lg font-semibold tabular text-gain">+{money(income)}</p></div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Доходность</p>
        <p className="font-semibold tabular">+{pct(termRate, 2)} за {deal.term_days} дней</p>
        <p className="text-sm text-muted-foreground">{pct(deal.investor_rate, 2)} — ставка на остаток</p>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">Сравнение дохода</h3>
        {[
          { label: "Сделка", value: income, color: "bg-lime" },
          { label: "Вклад 18,42% годовых", value: depositIncome, color: "bg-secondary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between gap-2 text-sm"><span>{label}</span><span className="font-semibold tabular">+{money(value)}</span></div>
            <div className="h-3 rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, value / comparisonMax * 100)}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2">
        {rows.map((row) => (
          <div key={row.number} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="whitespace-nowrap text-xs font-semibold tabular">{mln(row.payout)}</span>
            <span className="whitespace-nowrap text-[10px] text-gain tabular">+{mln(row.income)}</span>
            <div className="flex h-24 w-full items-end justify-center">
              <div className="flex w-full max-w-12 flex-col justify-end overflow-hidden rounded-2xl bg-lime/70" style={{ height: `${Math.max(2, row.payout / payoutMax * 100)}%` }}>
                <div className="bg-lime" style={{ height: `${row.payout ? row.income / row.payout * 100 : 0}%` }} />
              </div>
            </div>
            <span className="whitespace-nowrap text-xs text-muted-foreground">{row.due_date ? dateShort(row.due_date) : `День ${row.day}`}</span>
          </div>
        ))}
      </div>
      {!inChat && <AskAiButton question={`Покажи график выплат для ${mln(amount)}`} deal_id={deal.id} title={deal.title} block="Калькулятор" />}
    </GlassCard>
  );
}
