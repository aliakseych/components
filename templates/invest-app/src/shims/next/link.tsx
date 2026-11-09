"use client";

// Stand-in for next/link on top of the template router.
import type { AnchorHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { useRouter } from "../router";

type Href = string | { pathname?: string; query?: Record<string, string | number | undefined> };

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: Href;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

export function toHref(href: Href): string {
  if (typeof href === "string") return href;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(href.query ?? {})) {
    if (value !== undefined) query.set(key, String(value));
  }
  const search = query.toString();
  return `${href.pathname ?? ""}${search ? `?${search}` : ""}`;
}

export default function Link({ href, replace, scroll: _scroll, prefetch: _prefetch, onClick, target, ...props }: LinkProps) {
  const router = useRouter();
  const url = toHref(href);
  const external = /^[a-z]+:/i.test(url);

  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || external || target === "_blank") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (replace) router.replace(url);
    else router.push(url);
  };

  return <a {...props} href={url} onClick={handle} target={target} />;
}
