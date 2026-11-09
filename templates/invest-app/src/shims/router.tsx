"use client";

// A small client router that stands in for the Next.js App Router, so the app runs as a plain
// Vite SPA and inside the gallery preview. "memory" keeps the path in state (gallery iframe),
// "history" uses the address bar (standalone app).
import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from "react";

import { motion } from "motion/react";
import { screenEnter } from "@/lib/motion";

export type RouterMode = "memory" | "history";

export interface Route {
  /** Pattern such as "/deals/:id". */
  path: string;
  Component: ComponentType;
}

interface Location {
  pathname: string;
  search: string;
}

interface RouterValue {
  location: Location;
  params: Record<string, string>;
  /** 1 after push/replace, -1 after back; drives the screen transition direction. */
  direction: 1 | -1;
  /** Bumped by refresh() so data hooks fetch again. */
  version: number;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  refresh: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function parse(href: string): Location {
  const url = new URL(href, "http://app.local");
  return { pathname: url.pathname, search: url.search };
}

export function match(pattern: string, pathname: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = pathname.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

class RedirectSignal extends Error {
  constructor(public href: string) {
    super(`redirect ${href}`);
  }
}
class NotFoundSignal extends Error {
  constructor() {
    super("not found");
  }
}

/** Same contract as next/navigation: throws, and the router boundary handles it. */
export function redirect(href: string): never {
  throw new RedirectSignal(href);
}
export function notFound(): never {
  throw new NotFoundSignal();
}

export function RouterProvider({
  mode = "history",
  initialPath = "/",
  children,
}: {
  mode?: RouterMode;
  initialPath?: string;
  children: ReactNode;
}) {
  const [stack, setStack] = useState<Location[]>(() => [
    mode === "history" ? { pathname: location.pathname, search: location.search } : parse(initialPath),
  ]);
  const [version, setVersion] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const current = stack[stack.length - 1];

  useEffect(() => {
    if (mode !== "history") return;
    const onPop = () => {
      setDirection(-1);
      setStack((s) => [...s.slice(0, -1), { pathname: location.pathname, search: location.search }]);
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, [mode]);

  const go = useCallback(
    (href: string, replace: boolean) => {
      const next = parse(href);
      setDirection(1);
      if (mode === "history") {
        const url = next.pathname + next.search;
        if (replace) history.replaceState(null, "", url);
        else history.pushState(null, "", url);
      }
      setStack((s) => (replace ? [...s.slice(0, -1), next] : [...s, next]));
      window.scrollTo(0, 0);
    },
    [mode],
  );

  const value = useMemo<RouterValue>(
    () => ({
      location: current,
      params: {},
      direction,
      version,
      push: (href) => go(href, false),
      replace: (href) => go(href, true),
      back: () => {
        if (mode === "history") history.back();
        setDirection(-1);
        if (mode !== "history") setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      },
      refresh: () => setVersion((v) => v + 1),
    }),
    [current, direction, version, go, mode],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouterValue() {
  const value = useContext(RouterContext);
  if (!value) throw new Error("Router hooks need <RouterProvider>.");
  return value;
}

/** Renders the first matching route; handles redirect() and notFound() thrown while rendering. */
export function Routes({ routes, notFound: NotFoundPage }: { routes: Route[]; notFound: ComponentType }) {
  const router = useRouterValue();
  for (const route of routes) {
    const params = match(route.path, router.location.pathname);
    if (params) {
      const key = router.location.pathname + router.location.search;
      return (
        <RouterContext.Provider value={{ ...router, params }}>
          {/* Keyed by pathname only: search changes (filters) keep the screen in place. */}
          <motion.div key={router.location.pathname} className="flex flex-1 flex-col" {...screenEnter(router.direction)}>
            <RouteBoundary key={key} notFound={NotFoundPage} onRedirect={router.replace}>
              <route.Component />
            </RouteBoundary>
          </motion.div>
        </RouterContext.Provider>
      );
    }
  }
  return <NotFoundPage />;
}

class RouteBoundary extends Component<
  { children: ReactNode; notFound: ComponentType; onRedirect: (href: string) => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (error instanceof RedirectSignal) this.props.onRedirect(error.href);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (error instanceof RedirectSignal) return null;
    if (error instanceof NotFoundSignal) {
      const NotFoundPage = this.props.notFound;
      return <NotFoundPage />;
    }
    throw error;
  }
}

export function useRouter() {
  const { push, replace, back, refresh } = useRouterValue();
  return useMemo(
    () => ({ push, replace, back, refresh, forward: () => history.forward(), prefetch: () => {} }),
    [push, replace, back, refresh],
  );
}

export function usePathname() {
  return useRouterValue().location.pathname;
}

export function useSearchParams() {
  const search = useRouterValue().location.search;
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useRouterValue().params as T;
}

/** Changes after router.refresh(); data hooks include it in their keys. */
export function useRouterVersion() {
  return useRouterValue().version;
}
