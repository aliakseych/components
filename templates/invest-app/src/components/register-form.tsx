"use client";

import { resetClientSession } from "@/lib/client-session";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api";
import type { Investor } from "@/lib/types";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await api<Investor>("/auth/register/", { method: "POST", body: JSON.stringify({ name, phone, password }) });
      await resetClientSession();
      router.push("/onboarding");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось создать аккаунт");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Имя</FieldLabel>
        <Input id="name" autoComplete="name" required className="h-14 rounded-2xl border-0 bg-muted px-4 text-lg" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="phone">Телефон</FieldLabel>
        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" required className="h-14 rounded-2xl border-0 bg-muted px-4 text-lg" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Пароль</FieldLabel>
        <Input id="password" type="password" autoComplete="new-password" minLength={6} required className="h-14 rounded-2xl border-0 bg-muted px-4 text-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-14 w-full rounded-full text-base" disabled={pending}>
        {pending ? <><Spinner /> Создаём…</> : "Создать аккаунт"}
      </Button>
    </form>
  );
}
