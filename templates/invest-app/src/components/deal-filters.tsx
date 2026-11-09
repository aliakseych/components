"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, days, pct } from "@/lib/format";
import type { DealCategory } from "@/lib/types";
import { useScrollEdges } from "@/lib/motion";

const categories = Object.keys(CATEGORY_LABEL) as DealCategory[];
const fields = ["sort", "min_rate", "max_min_investment", "max_days_left"] as const;
type Field = typeof fields[number];
type Draft = Record<Field, string>;

export function DealFilters({ count, closed }: { count: number; closed: boolean }) {
  const router = useRouter();
  const chipsEdges = useScrollEdges();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const qFromUrl = params.get("q") ?? "";
  const [search, setSearch] = useState(qFromUrl);
  // q, который мы сами последним отправили в URL. Когда навигация с ним доезжает,
  // поле не трогаем: человек мог уже допечатать дальше. Из URL берём только
  // внешние изменения (сброс фильтров, «Назад» браузера).
  const [sentQ, setSentQ] = useState(qFromUrl);
  const [previousQ, setPreviousQ] = useState(qFromUrl);
  if (previousQ !== qFromUrl) {
    setPreviousQ(qFromUrl);
    if (qFromUrl !== sentQ) {
      setSentQ(qFromUrl);
      setSearch(qFromUrl);
    }
  }
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft>({ sort: "", min_rate: "", max_min_investment: "", max_days_left: "" });
  const selected = (params.get("category") ?? "").split(",").filter(Boolean);
  const activeCount = fields.filter((field) => params.has(field) && params.get(field) !== "relevance").length;

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const suffix = next.toString();
    startTransition(() => router.replace(suffix ? `${pathname}?${suffix}` : pathname));
  }

  useEffect(() => {
    if (search.trim() === (params.get("q") ?? "")) return;
    const timer = window.setTimeout(() => {
      setSentQ(search.trim());
      update({ q: search.trim() });
    }, 300);
    return () => window.clearTimeout(timer);
    // The timer tracks the current URL and input, not the transition state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, query]);

  function showDrawer(value: boolean) {
    if (value) {
      setDraft(Object.fromEntries(fields.map((field) => [field, params.get(field) ?? ""])) as Draft);
    }
    setOpen(value);
  }

  function options(field: Field, title: string, values: [string, string][]) {
    return (
      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">{title}</legend>
        <div className="flex flex-wrap gap-2">
          {values.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={(draft[field] || (field === "sort" ? "relevance" : "")) === value} onClick={() => setDraft({ ...draft, [field]: value })} className={`min-h-11 rounded-full px-4 text-sm font-medium ${(draft[field] || (field === "sort" ? "relevance" : "")) === value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-12 items-center gap-2 rounded-full bg-card px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск: бензин, хлопок, Ташкент…" aria-label="Поиск сделок" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        {search && <button type="button" aria-label="Очистить поиск" onClick={() => setSearch("")} className="flex size-11 shrink-0 items-center justify-center"><X className="size-4" /></button>}
      </div>
      {closed && (
        <div className="flex rounded-full bg-muted p-1" aria-label="Статус выплат">
          {([['', 'Все'], ['active', 'Идут выплаты'], ['completed', 'Выплачено']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={(params.get("status") ?? "") === value} onClick={() => update({ status: value })} className={`min-h-11 min-w-0 flex-1 rounded-full px-1 text-xs font-semibold ${(params.get("status") ?? "") === value ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div ref={chipsEdges} data-testid="category-chips" className="edge-fade-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((category) => {
          const Icon = CATEGORY_ICON[category];
          const tone = CATEGORY_TONE[category];
          const isSelected = selected.includes(category);
          return (
            <button key={category} type="button" aria-pressed={isSelected} onClick={() => update({ category: (isSelected ? selected.filter((item) => item !== category) : [...selected, category]).join(",") })} className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium ${isSelected ? `${tone.bg} ${tone.fg}` : "bg-card"}`}>
              <Icon className="size-4" />{CATEGORY_LABEL[category]}
            </button>
          );
        })}
      </div>
      <Drawer open={open} onOpenChange={showDrawer}>
        <DrawerTrigger asChild>
          <button type="button" className="flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold">
            <SlidersHorizontal className="size-4" />Фильтры
            {activeCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{activeCount}</span>}
          </button>
        </DrawerTrigger>
        <DrawerContent className="mx-auto max-h-[90vh] max-w-md overflow-y-auto px-4 pb-6">
          <DrawerTitle className="mt-4 text-xl font-semibold">Фильтры</DrawerTitle>
          <DrawerDescription className="sr-only">Настройте параметры поиска сделок</DrawerDescription>
          <div className="mt-5 space-y-5">
            {options("sort", "Сортировка", [["relevance", "Подходящие"], ["rate", "Доходность"], ...(!closed ? [["deadline", "Скоро закроются"] as [string, string]] : []), ["collected", "Собрано"], ["new", "Новые"], ["amount", "Сумма"]])}
            {options("min_rate", "Доходность от", [["", "Любая"], ["15", pct(15)], ["18", pct(18)], ["19", pct(19)]])}
            {options("max_min_investment", "Вход до", [["", "Любой"], ["1000000", "1млн"], ["5000000", "5млн"], ["10000000", "10млн"]])}
            {!closed && options("max_days_left", "Закроется за", [["", "Любое"], ["3", days(3)], ["7", days(7)]])}
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setDraft({ sort: "", min_rate: "", max_min_investment: "", max_days_left: "" })} className="h-12 flex-1 rounded-full bg-muted font-semibold">Сбросить</button>
            <button type="button" onClick={() => { update(draft); setOpen(false); }} className="h-12 flex-1 rounded-full bg-primary font-semibold text-primary-foreground">Показать</button>
          </div>
        </DrawerContent>
      </Drawer>
      <p className="text-sm text-muted-foreground">Найдено {count}</p>
    </div>
  );
}
