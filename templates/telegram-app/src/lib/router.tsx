// A tiny router: the browser history in the standalone app, an in-memory path in the gallery.
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Router = { path: string; params: URLSearchParams; go: (to: string) => void; back: () => void };

const Ctx = createContext<Router | null>(null);

export function RouterProvider({ mode, initialPath = "/", children }: { mode: "history" | "memory"; initialPath?: string; children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([mode === "history" ? location.pathname + location.search : initialPath]);
  const path = stack[stack.length - 1];

  useEffect(() => {
    if (mode !== "history") return;
    const onPop = () => setStack([location.pathname + location.search]);
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, [mode]);

  const go = useCallback(
    (to: string) => {
      if (mode === "history") history.pushState(null, "", to);
      setStack((s) => [...s, to]);
    },
    [mode],
  );
  const back = useCallback(() => {
    if (mode === "history") history.back();
    else setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, [mode]);

  const value = useMemo<Router>(() => {
    const url = new URL(path, "http://app");
    return { path: url.pathname, params: url.searchParams, go, back };
  }, [path, go, back]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter() {
  const router = useContext(Ctx);
  if (!router) throw new Error("useRouter must be used inside RouterProvider");
  return router;
}
