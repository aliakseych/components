"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { SwipeConfirm } from "@/components/viz/swipe-confirm";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { AgentAction } from "@/lib/types";

const STATUS: Record<AgentAction["status"], string> = {
  pending: "Ожидает подтверждения",
  executed: "Выполнено",
  rejected: "Отклонено",
  failed: "Не выполнено",
};

export function AgentActionSheet({ action, open, onOpenChange, onDone }: {
  action: AgentAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: (action: AgentAction) => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(action);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const refreshOnClose = useRef(false);

  async function submit(kind: "execute" | "reject") {
    if (inFlight.current || current.status !== "pending") return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await api<AgentAction>(`/agent/actions/${current.id}/${kind}/`, { method: "POST" });
      setCurrent(updated);
      onDone(updated);
      if (kind === "execute") {
        refreshOnClose.current = true;
        toast.success("Действие выполнено");
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Не удалось выполнить действие";
      setError(message);
      try {
        const latest = await api<{ items: AgentAction[] }>("/agent/actions/");
        const updated = latest.items.find((item) => item.id === current.id);
        if (updated) {
          setCurrent(updated);
          onDone(updated);
        }
      } catch {
        // Оставляем сообщение об ошибке, если статус не удалось обновить.
      }
      refreshOnClose.current = true;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <Drawer open={open} onOpenChange={(nextOpen) => {
    if (!nextOpen && busy) return;
    onOpenChange(nextOpen);
    if (!nextOpen && refreshOnClose.current) router.refresh();
  }}>
    <DrawerContent className="mx-auto max-w-md rounded-t-[28px]">
      <div className="space-y-5 overflow-y-auto p-5 pb-8">
        <DrawerHeader className="p-0 text-left">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-foreground"><span className="flex size-10 items-center justify-center rounded-full bg-accent"><Sparkles className="size-5" /></span>{current.source} предлагает</div>
          <DrawerTitle className="text-left text-2xl font-semibold">{current.title}</DrawerTitle>
        </DrawerHeader>
        {current.status === "executed" ? <div className="space-y-3 rounded-[24px] bg-lime p-5 text-lime-foreground"><span className="flex size-12 items-center justify-center rounded-full bg-white/60"><Check className="size-6" /></span><p className="text-xl font-semibold">Выполнено</p>{current.result && <p>{current.result}</p>}</div> : <>
          <p className="tabular break-words text-4xl font-semibold tracking-tight">{money(current.amount)}</p>
          {current.deal_id !== null && <Link href={`/deals/${current.deal_id}`} className="inline-flex min-h-11 items-center rounded-full bg-secondary px-4 text-sm font-medium">{current.deal_title || "Сделка"} ↗</Link>}
          {current.reason && <p className="rounded-[20px] bg-muted p-4 text-sm leading-relaxed">{current.reason}</p>}
          {current.status === "pending" ? <>
            <div className="space-y-2"><p className="font-semibold">Что произойдёт</p><div className="flex flex-wrap gap-2">{(current.kind === "invest" ? [`Спишем ${money(current.amount)} со счёта`, `Вложим в ${current.deal_title || "сделку"}`] : ["Пополним счёт"]).map((text) => <span key={text} className="rounded-2xl bg-secondary px-3 py-2 text-sm">{text}</span>)}</div></div>
            <SwipeConfirm label="Потяните, чтобы выполнить" onConfirm={() => submit("execute")} disabled={busy} />
            <button type="button" disabled={busy} onClick={() => submit("reject")} className="min-h-11 w-full text-sm font-medium text-muted-foreground disabled:opacity-50">Отклонить</button>
          </> : <div className="space-y-2"><p className="font-semibold">{STATUS[current.status]}</p>{current.result && !error && <p className="text-sm text-muted-foreground">{current.result}</p>}</div>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </>}
      </div>
    </DrawerContent>
  </Drawer>;
}
