"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { SwipeConfirm } from "@/components/viz/swipe-confirm";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { Investor } from "@/lib/types";

export function TopupDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    try {
      await api<Investor>("/account/topup/", { method: "POST", body: JSON.stringify({ amount }) });
      toast.success(`Счёт пополнен на ${money(amount)}`);
      setOpen(false);
      setAmount(0);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось пополнить");
    } finally {
      setPending(false);
    }
  }

  return <Drawer open={open} onOpenChange={setOpen}>
    <DrawerTrigger asChild><button type="button" className="flex flex-col items-center gap-2 text-sm font-medium"><span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus className="size-6" /></span>Пополнить</button></DrawerTrigger>
    <DrawerContent className="mx-auto max-w-md rounded-t-[28px]">
      <div className="space-y-6 p-5 pb-8">
        <DrawerHeader className="p-0 text-left"><DrawerTitle className="text-xl">Пополнить счёт</DrawerTitle></DrawerHeader>
        <div className="text-center"><input aria-label="Сумма пополнения" inputMode="numeric" placeholder="0" value={amount ? amount.toLocaleString("ru-RU") : ""} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "").slice(0, 13)))} className="tabular h-16 w-full bg-transparent text-center text-4xl font-semibold outline-none placeholder:text-muted-foreground" /><span className="text-sm text-muted-foreground">сум</span></div>
        <div className="grid grid-cols-4 gap-2">{[1_000_000, 2_000_000, 5_000_000, 10_000_000].map((value) => <button key={value} type="button" onClick={() => setAmount(value)} aria-pressed={amount === value} className={`h-11 rounded-full text-sm font-medium ${amount === value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{value / 1_000_000}млн</button>)}</div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <SwipeConfirm label="Потяните, чтобы пополнить" onConfirm={submit} disabled={!amount || pending} />
      </div>
    </DrawerContent>
  </Drawer>;
}
