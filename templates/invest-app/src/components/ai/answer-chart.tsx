"use client";

import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { AiChart } from "@/lib/types";

const colors = ["var(--lime)", "var(--accent)", "#a5b4fc", "#84cc16", "#c4b5fd"];
const config = { value: { label: "Значение", color: "var(--lime)" } };

export function AnswerChart({ chart }: { chart: AiChart }) {
  const unit = chart.unit.trim().replace(/^млн\s*сум$/i, "млн");
  const format = (value: number) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)}${/^(?:сум|дней|дня|день|дн\.)$/i.test(unit) ? "\u00a0" : ""}${unit}`;
  const tooltip = <Tooltip formatter={(value) => format(Number(value))} contentStyle={{ borderRadius: 16, fontSize: 12 }} />;
  // Подписи оси — коротко, чтобы не обрезались: «3,6млн», «450тыс», иначе как в подсказке.
  const short = (value: number) => {
    const n = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
    if (unit === "сум" && Math.abs(value) >= 1e6) return `${n.format(value / 1e6)}млн`;
    if (unit === "сум" && Math.abs(value) >= 1e3) return `${n.format(value / 1e3)}тыс`;
    return format(value);
  };
  const axes = <><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><YAxis tickFormatter={short} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={48} /></>;
  return (
    <div className="min-w-0 rounded-[24px] bg-card p-4">
      <p className="mb-2 text-sm font-semibold">{chart.title}</p>
      <ChartContainer config={config} className="h-48 w-full">
        {chart.type === "pie" ? (
          <PieChart><Pie data={chart.data} dataKey="value" nameKey="label" innerRadius="45%" outerRadius="80%">{chart.data.map((item, index) => <Cell key={`${item.label}-${index}`} fill={colors[index % colors.length]} />)}</Pie>{tooltip}</PieChart>
        ) : chart.type === "line" ? (
          <LineChart data={chart.data}>{axes}{tooltip}<Line type="monotone" dataKey="value" stroke={colors[1]} strokeWidth={3} dot={{ r: 3 }} /></LineChart>
        ) : chart.type === "area" ? (
          <AreaChart data={chart.data}>{axes}{tooltip}<Area type="monotone" dataKey="value" stroke={colors[1]} fill={colors[1]} fillOpacity={0.4} strokeWidth={2} /></AreaChart>
        ) : (
          <BarChart data={chart.data}>{axes}{tooltip}<Bar dataKey="value" fill={colors[0]} radius={[6, 6, 0, 0]} /></BarChart>
        )}
      </ChartContainer>
    </div>
  );
}
