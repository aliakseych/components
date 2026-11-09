"use client";

// Data hook that replaces the server-component fetches of the original Next.js app.
// Mock mode answers synchronously, so screens render with data on the first frame.
import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter, useRouterVersion, usePathname } from "@/shims/router";
import { api, ApiError, isMock, peek } from "./api";

export type ApiState<T> =
  | { status: "ready"; data: T; error: null }
  | { status: "loading"; data: undefined; error: null }
  | { status: "error"; data: undefined; error: ApiError };

interface Options {
  /** 401 sends the user to /login (the old apiAuth). Otherwise 401 yields data = null (apiOptional). */
  auth?: boolean;
  /** Fetch asynchronously even in mock mode (AI endpoints), so loading skeletons show. */
  defer?: boolean;
}

function settle<T>(run: () => T, auth: boolean | undefined): ApiState<T | null> {
  try {
    return { status: "ready", data: run(), error: null };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 && !auth) return { status: "ready", data: null, error: null };
      return { status: "error", data: undefined, error };
    }
    throw error;
  }
}

export function useApi<T>(path: string | null, options: Options = {}): ApiState<T | null> {
  const version = useRouterVersion();
  const mock = isMock() && !options.defer;
  const sync = useMemo(
    () => (mock && path ? settle(() => peek<T>(path), options.auth) : null),
    // version: refetch after router.refresh() picks up mutations made by the mock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mock, path, version, options.auth],
  );
  const [remote, setRemote] = useState<ApiState<T | null>>({ status: "loading", data: undefined, error: null });

  useEffect(() => {
    if (mock || !path) return;
    let alive = true;
    setRemote({ status: "loading", data: undefined, error: null });
    api<T>(path)
      .then((data) => alive && setRemote({ status: "ready", data, error: null }))
      .catch((error) => alive && setRemote(settle(() => { throw error; }, options.auth)));
    return () => {
      alive = false;
    };
  }, [mock, path, version, options.auth]);

  const state = sync ?? remote;
  useAuthRedirect(state, options.auth);
  if (state.status === "error" && state.error.status === 404) notFound();
  return state;
}

function useAuthRedirect(state: ApiState<unknown>, auth?: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const unauthorized = auth && state.status === "error" && state.error.status === 401;
  useEffect(() => {
    if (unauthorized) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [unauthorized, router, pathname]);
}
