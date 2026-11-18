// Entry used by the gallery: renders one screen in the requested theme.
import { createRoot, type Root } from "react-dom/client";
import { App } from "./app";
import "./index.css";

// A container can only be passed to createRoot once; remount into the same root.
const roots = new WeakMap<HTMLElement, Root>();

export function mount(element: HTMLElement, { path, theme }: { path: string; theme: string }) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }
  const menuOpen = new URL(path, "http://x").searchParams.has("menu");
  root.render(<App key={path} menuOpen={menuOpen} />);
}
