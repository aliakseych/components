"use client";

import { resetClientSession } from "@/lib/client-session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export function DemoAccountCta() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setPending(true);
    setError("");
    try {
      await api("/auth/login/", { method: "POST", body: JSON.stringify({ phone: "998901234567", password: "demo1234" }) });
      await resetClientSession();
      router.refresh();
    } catch {
      setError("Не удалось открыть демо-счёт");
    } finally {
      setPending(false);
    }
  }

  return <section id="demo-account" className="min-w-0 space-y-3 rounded-[28px] bg-accent p-5 text-accent-foreground">
    <div className="flex min-w-0 items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground"><Sparkles className="size-5" /></span><h2 className="min-w-0 text-xl font-semibold leading-tight">Демо-счёт за 1 касание</h2></div>
    <p className="text-sm">30млн ненастоящих денег, чтобы попробовать</p>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <button type="button" disabled={pending} onClick={login} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60">{pending && <Loader2 className="size-5 animate-spin" />}Попробовать</button>
    <Link href="/register" className="flex h-12 w-full items-center justify-center rounded-full bg-card px-4 font-semibold text-foreground">Создать аккаунт</Link>
  </section>;
}
