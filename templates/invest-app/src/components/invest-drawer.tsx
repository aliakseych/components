"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AmountInput } from "@/components/amount-input";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { SwipeConfirm } from "@/components/viz/swipe-confirm";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { DealDetail } from "@/lib/types";

export function InvestDrawer({ deal, balance }: { deal: DealDetail; balance: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);
  const all = Math.max(0, Math.floor(Math.min(Number(balance), Number(deal.investors_amount) - Number(deal.collected_amount))));
  const share = Number(deal.investors_amount) ? amount / Number(deal.investors_amount) : 0;
  const rows = deal.installments.map((i) => ({
    payout: Number(i.investors_payout) * share,
    income: Number(i.investors_income) * share,
  }));
  const total = rows.reduce((sum, row) => sum + row.payout, 0);
  const income = rows.reduce((sum, row) => sum + row.income, 0);
  const max = Math.max(1, ...rows.map((row) => row.payout));

  async function submit() {
    setError("");
    try {
      await api<DealDetail>(`/deals/${deal.id}/invest/`, { method: "POST", body: JSON.stringify({ amount }) });
      setDone(amount);
      toast.success(`Вы вложили ${money(amount)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось отправить");
    }
  }

  return (
    <Drawer onOpenChange={(open) => {
      if (!open) {
        setAmount(0);
        setConsent(false);
        setError("");
        setDone(0);
      }
    }}>
      <DrawerTrigger asChild>
        <Button className="h-14 w-full rounded-full text-base">Вложить</Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md rounded-t-[28px] bg-card">
        {done ? (
          <div className="flex flex-col items-center gap-5 p-6 pb-8 text-center">
            <span className="flex size-24 items-center justify-center rounded-full bg-lime text-lime-foreground">
              <Check className="size-12" />
            </span>
            <DrawerTitle className="text-2xl font-semibold tabular">+{money(done)} в работе</DrawerTitle>
            <Button asChild className="h-14 w-full rounded-full">
              <Link href={`/portfolio/${deal.id}`}>К вложению</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto p-5 pb-8">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-2xl font-semibold">Сколько вложить?</DrawerTitle>
              <span className="mt-2 inline-flex w-fit rounded-full bg-secondary px-3 py-2 text-sm">Баланс {money(balance)}</span>
            </DrawerHeader>
            <AmountInput value={amount} onChange={setAmount} />
            <div className="flex gap-2">
              {[1_000_000, 5_000_000, 10_000_000].map((v) => (
                <button key={v} type="button" onClick={() => setAmount(v)} className={`h-11 min-w-0 flex-1 rounded-full text-sm font-medium ${amount === v ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {v / 1_000_000}млн
                </button>
              ))}
              <button type="button" onClick={() => setAmount(all)} className={`h-11 flex-1 rounded-full text-sm font-medium ${all > 0 && amount === all ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                Всё
              </button>
            </div>
            <div className="flex items-end justify-between gap-3 rounded-[24px] bg-secondary p-4">
              <div>
                <div className="text-sm text-muted-foreground">Вернётся</div>
                <div className="text-2xl font-semibold tabular">{money(total)}</div>
                <span className="mt-2 inline-flex rounded-full bg-lime px-3 py-1 text-sm font-semibold text-lime-foreground">+{money(income)}</span>
              </div>
              <div className="flex h-14 items-end gap-1" aria-label="График выплат">
                {rows.map((row, i) => (
                  <div key={i} className="w-3 rounded-t-full bg-primary" style={{ height: `${Math.max(4, row.payout / max * 100)}%` }} />
                ))}
              </div>
            </div>
            <button type="button" role="switch" aria-checked={consent} onClick={() => setConsent(!consent)} className="flex min-h-11 w-full items-center justify-between gap-3 text-left">
              <span>Понимаю: это не вклад</span>
              <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 ${consent ? "justify-end bg-lime" : "justify-start bg-muted-foreground/30"}`}>
                <span className="size-5 rounded-full bg-card shadow-sm" />
              </span>
            </button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <SwipeConfirm label="Потяните, чтобы вложить" disabled={amount <= 0 || !consent} onConfirm={submit} />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
