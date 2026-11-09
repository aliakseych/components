"use client";

import { Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/viz/glass-card";
import { dateLong, money } from "@/lib/format";
import type { Company } from "@/lib/types";

export function CopyInn({ inn }: { inn: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(inn);
      toast.success("Скопировано");
    } catch {
      toast.error("Не удалось скопировать");
    }
  }
  return (
    <button type="button" onClick={copy} aria-label="Скопировать ИНН" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-medium">
      ИНН {inn}<Copy className="size-4" />
    </button>
  );
}

export function RequisitesCard({ company }: { company: Company }) {
  const rows = [
    ["Форма", company.legal_form],
    ["Полное название", company.legal_name],
    ["Директор", company.director],
    ["Регистрация", company.registered_at ? dateLong(company.registered_at) : null],
    ["Уставный капитал", company.charter_capital != null ? money(company.charter_capital) : null],
    ["Сотрудников", company.employees != null ? company.employees.toLocaleString("ru-RU") : null],
    ["Деятельность", company.activity],
    ["Адрес", company.address],
    ["Источник погашения", company.repayment_source],
  ];
  return (
    <GlassCard className="space-y-4">
      <h2 className="text-lg font-semibold">Реквизиты</h2>
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-right font-medium break-words">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <a href={company.orginfo_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-medium">
        {company.orginfo_direct ? <>Открыть на orginfo.uz <ExternalLink className="size-4" /></> : <>Найти на orginfo.uz по ИНН <Search className="size-4" /></>}
      </a>
    </GlassCard>
  );
}
