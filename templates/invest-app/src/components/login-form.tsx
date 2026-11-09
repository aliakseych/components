"use client";

import { resetClientSession } from "@/lib/client-session";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api";
import type { Investor } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("998901234567");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await api<Investor>("/auth/login/", { method: "POST", body: JSON.stringify({ phone, password }) });
      // Страницы гостя/прошлого пользователя в кэше PWA больше не нужны.
      await resetClientSession();
      const next = searchParams.get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось войти");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="phone">Телефон</FieldLabel>
        <Input id="phone" type="tel" autoComplete="tel" className="h-14 rounded-2xl border-0 bg-muted px-4 text-lg" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Пароль</FieldLabel>
        <Input id="password" type="password" autoComplete="current-password" className="h-14 rounded-2xl border-0 bg-muted px-4 text-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-xs text-accent-foreground">
        <Info className="size-4 shrink-0" />
        Демо-профиль: деньги ненастоящие, можно смело нажимать
      </p>
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={pending}>
        {pending ? <><Spinner /> Входим…</> : "Попробовать"}
      </Button>
    </form>
  );
}
