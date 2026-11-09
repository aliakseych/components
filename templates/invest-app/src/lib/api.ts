// Single entry point for API requests. With config.apiUrl set, requests go to the server in
// server/ (session cookie included). Without it, src/lib/mock-api.ts answers from sample data.
import { getConfig } from "@/template.config";
import { mockRequest } from "./mock-api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function isMock() {
  return !getConfig().apiUrl;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (isMock()) {
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    // A short pause so pending states (spinners, "thinking") stay visible in the demo.
    await new Promise((resolve) => setTimeout(resolve, path.startsWith("/ai/") ? 900 : 120));
    return mockRequest(init?.method ?? "GET", path, body) as T;
  }
  const res = await fetch(`${getConfig().apiUrl.replace(/\/$/, "")}/api${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `HTTP ${res.status}`);
  return data as T;
}

/** Synchronous read for GET requests in mock mode, so the first render already has data. */
export function peek<T>(path: string): T {
  return mockRequest("GET", path, undefined) as T;
}
