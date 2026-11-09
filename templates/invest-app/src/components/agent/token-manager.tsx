"use client";

import { useScrollEdges } from "@/lib/motion";
import { useState, useSyncExternalStore } from "react";
import { Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/viz/glass-card";
import { api, ApiError } from "@/lib/api";
import { dateShort } from "@/lib/format";
import type { AgentToken } from "@/lib/types";
import { getConfig } from "@/template.config";

type Tab = "Claude" | "Claude Code" | "Cursor / VS Code" | "Другие";
const TABS: Tab[] = ["Claude", "Claude Code", "Cursor / VS Code", "Другие"];
const subscribe = () => () => {};
const getUrl = () => `${(getConfig().apiUrl || window.location.origin).replace(/\/$/, "")}/api/mcp/`;
const getServerUrl = () => "";

export function TokenManager({ initialTokens }: { initialTokens: AgentToken[] }) {
  const [tokens, setTokens] = useState(initialTokens);
  const tabsEdges = useScrollEdges();
  const [name, setName] = useState("Claude");
  const [created, setCreated] = useState<AgentToken | null>(null);
  const [tab, setTab] = useState<Tab>("Claude");
  const url = useSyncExternalStore(subscribe, getUrl, getServerUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (busy || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const token = await api<AgentToken>("/agent/tokens/", { method: "POST", body: JSON.stringify({ name: name.trim() }) });
      setCreated(token);
      setTokens((previous) => [token, ...previous]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось создать ключ");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api(`/agent/tokens/${id}/revoke/`, { method: "POST" });
      setTokens((previous) => previous.filter((token) => token.id !== id));
      setCreated((previous) => previous?.id === id ? null : previous);
      toast.success("Ключ отозван");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось отозвать ключ");
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Скопировано");
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  const secret = created?.token ?? "";
  const snippets: Record<Tab, string> = {
    "Claude": `URL: ${url}\nAuthorization: Bearer ${secret}`,
    "Claude Code": `claude mcp add --transport http ${getConfig().brand.storageKey} ${url} --header "Authorization: Bearer ${secret}"`,
    "Cursor / VS Code": JSON.stringify({ mcpServers: { [getConfig().brand.storageKey]: { url, headers: { Authorization: `Bearer ${secret}` } } } }, null, 2),
    "Другие": `URL: ${url}\nAuthorization: Bearer ${secret}`,
  };

  return <div className="space-y-6">
    <GlassCard className="space-y-4"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground"><KeyRound className="size-5" /></span><h2 className="text-lg font-semibold">Ключ доступа</h2></div>
      <label htmlFor="agent-name" className="block text-sm text-muted-foreground">Название ключа</label>
      <input id="agent-name" value={name} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-2xl bg-muted px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" />
      <button type="button" disabled={busy || !name.trim()} onClick={create} className="min-h-12 w-full rounded-full bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">Создать ключ</button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </GlassCard>
    {created?.token && <GlassCard className="space-y-4"><div><h2 className="text-lg font-semibold">Сохраните ключ</h2><p className="text-sm text-muted-foreground">Он показывается только сейчас. Не передавайте его другим.</p></div><div className="flex items-start gap-2 rounded-2xl bg-muted p-3"><code className="min-w-0 flex-1 break-all text-xs">{created.token}</code><button type="button" aria-label="Скопировать ключ" onClick={() => copy(created.token!)} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card"><Copy className="size-4" /></button></div>
      <div ref={tabsEdges} className="edge-fade-x flex gap-2 overflow-x-auto" role="tablist" aria-label="Инструкция подключения">{TABS.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{item}</button>)}</div>
      {tab === "Claude" && <p className="text-sm text-muted-foreground">Settings → Connectors → Add custom connector: укажите URL и заголовок.</p>}
      {tab === "Cursor / VS Code" && <p className="text-sm text-muted-foreground">Добавьте в mcp.json:</p>}
      <div className="rounded-2xl bg-muted p-4"><pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs">{snippets[tab]}</pre><button type="button" onClick={() => copy(snippets[tab])} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium"><Copy className="size-4" />Скопировать</button></div>
    </GlassCard>}
    <section className="space-y-3"><h2 className="text-xl font-semibold">Ваши ключи</h2>{tokens.length ? <GlassCard className="divide-y divide-border">{tokens.map((token) => <div key={token.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><p className="break-words font-semibold">{token.name}</p><p className="text-sm text-muted-foreground">Создан {dateShort(token.created_at)} · {token.last_used_at ? `Использован ${dateShort(token.last_used_at)}` : "Не использовался"}</p></div><button type="button" disabled={busy} onClick={() => revoke(token.id)} className="min-h-11 rounded-full bg-muted px-4 text-sm font-medium disabled:opacity-50">Отозвать</button></div>)}</GlassCard> : <p className="text-sm text-muted-foreground">Ключей пока нет</p>}</section>
  </div>;
}
